import Cookies from 'js-cookie';
import { login, confirm, getProfile, sendCode } from './api';

class Auth {
  constructor () {
    this.phone = null;
    this.userId = null;

    const auth = Cookies.get('auth');
    this.profileDef = $.Deferred();
    if (auth) {
      const [token, phone] = auth.split('|');
      if (token && phone) {
        this.token = token;
        this.phone = phone;

        getProfile(token).then(
          profile => {
            this.profile = profile;
            this.profileDef.resolve(profile);
          },
          err => this.setToken(null, null)
        );
      }
    } else {
      this.profileDef.reject('not_auth');
    }
  }

  getProfile () {
    if (this.profile) return $.Deferred.reslove(this.profile);
    return this.profileDef;
  }

  auth (phone) {
    this.phone = phone;
    // if (this.token && this.phone === phone) return $.Deferred().resolve(this.token);
    return login(phone)
      .then(resp => this.showConfirmPopup(resp.id))
      .then(token => this.setToken(phone, token))
  }

  logout() {
    this.setToken(null, null);
  }

  setToken (phone, token) {
    if (!phone || !token) {
      Cookies.remove('auth');
      return null;
    }
    Cookies.set('auth', `${token}|${phone}`, { expires: 365 });
    this.token = token;
    this.phone = phone;
    return token;
  }

  /**
   * Возвращает токен
   * @param {string} userId
   * @return {Promise.<string>}
   */
  showConfirmPopup (userId) {
    this.userId = userId;
    const def = $.Deferred();
    const $popup = $('#popup-confirm');
    const $form = $popup.find('form');
    const $code = $popup.find('.input__input');
    const $error = $popup.find('.popup__error');
    let success = false;

    $.magnificPopup.open({
      items:     { src: '#popup-confirm' },
      type:      'inline',
      callbacks: {
        close: () => {
          $form.off('submit.confirm');
          if (!success) def.reject('auth_reject');
        }
      }
    }, 0);

    $form.on('submit.confirm', (e) => {
      e.preventDefault();
      $error.html('');
      confirm(userId, $code.val()).then((res) => {
        if (!res.correct) return $error.html('Введен неверный код');
        success = true;
        $.magnificPopup.close();
        def.resolve(res.token);
      });
    });

    return def;
  }

  resendCode() {
    if(!this.userId || !this.phone) return;
    return sendCode(this.userId, this.phone);
  }
}

export default new Auth();