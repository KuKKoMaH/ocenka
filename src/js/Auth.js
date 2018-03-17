import Cookies from 'js-cookie';
import * as API from './api';

class Auth {
  constructor() {
    this.phone = null;
    this.userId = null;

    const auth = Cookies.get('auth');
    this.profileDef = $.Deferred();
    if (auth) {
      const [token, phone] = auth.split('|');
      if (token && phone) {
        this.token = token;
        this.phone = phone;

        setTimeout(() => {
          API.getProfile(token, true).then(
            profile => {
              this.profile = profile;
              this.profileDef.resolve(profile);
            },
            () => {
              this.setToken(null, null);
              this.profileDef.reject('auth_expired');
            }
          );
        }, 0);
      }
    } else {
      this.profileDef.reject('not_auth');
    }
  }

  getProfile() {
    if (this.profile) return $.Deferred().resolve(this.profile);
    return this.profileDef;
  }

  auth(phone) {
    return API.login(phone)
      .then(resp => {
        this.phone = phone;
        this.userId = resp.id;
        return this.showConfirmPopup(resp.id, resp.activated)
      })
      .then(token => this.setToken(phone, token))
  }

  logout() {
    this.setToken(null, null);
  }

  setToken(phone, token) {
    if (!phone || !token) {
      Cookies.remove('auth');
    } else {
      Cookies.set('auth', `${token}|${phone}`, { expires: 365 });
    }
    this.token = token;
    this.phone = phone;
    return token;
  }

  showLoginPopup() {
    const $popup = $('#popup-register');
    const $form = $popup.find('form');
    const $phone = $popup.find('.input__input');
    const $error = $popup.find('.popup__error');
    const def = $.Deferred();
    let success = false;

    $.magnificPopup.open({
      items:     {
        src:  '#popup-register',
        type: 'inline'
      },
      callbacks: {
        close:      () => {
          $form.off('submit.confirm');
          if (!success) def.reject('auth_reject');
        },
        beforeOpen: function () {
          if ($(window).width() < 700) {
            this.st.focus = false;
          } else {
            this.st.focus = '#auth-phone';
          }
        },
      },
    });

    $form.on('submit.confirm', (e) => {
      e.preventDefault();
      const phone = $phone.val();
      $error.html('');
      return API.login(phone).then(
        (resp) => {
          this.phone = phone;
          this.userId = resp.id;
          success = true;
          $.magnificPopup.close();

          return this.showConfirmPopup(resp.id, resp.activated);
        },
        (err) => {
          $error.html(err.responseJSON.message);
          throw err;
        }
      )
        .then(token => this.setToken(phone, token))
        .then(def.resolve, def.reject);

    });

    return def;
  }

  /**
   * Возвращает токен
   * @param {string} userId
   * @param {boolean} activated
   * @return {Promise.<string>}
   */
  showConfirmPopup(userId, activated) {
    this.userId = userId;
    const def = $.Deferred();
    const $popup = $('#popup-confirm');
    const $form = $popup.find('form');
    const $code = $popup.find('.input__input');
    const $error = $popup.find('.popup__error');
    let success = false;

    $popup.find('.popup__desc').hide();
    $popup.find('.popup__resend').hide();
    $popup.find(activated ? '.activated' : '.not_activated').show();

    $.magnificPopup.open({
      items:     { src: '#popup-confirm' },
      type:      'inline',
      callbacks: {
        close:      () => {
          $form.off('submit.confirm');
          if (!success) def.reject('auth_reject');
        },
        beforeOpen: function () {
          if ($(window).width() < 700) {
            this.st.focus = false;
          } else {
            this.st.focus = '#auth-password';
          }
        },
      }
    }, 0);

    let token;
    $form.on('submit.confirm', (e) => {
      e.preventDefault();
      $error.html('');
      API.confirm(userId, $code.val()).then((res) => {
        if (!res.correct) return $error.html('Введен неверный код');
        success = true;
        token = res.token;
        return API.getProfile(res.token).then(profile => {
          $.magnificPopup.close();
          this.profileDef = $.Deferred().resolve(profile);
          def.resolve(token);
        });
      });
    });

    return def;
  }

  resendCode() {
    if (!this.userId || !this.phone) return;
    return API.sendCode(this.userId, this.phone);
  }
}

export default new Auth();