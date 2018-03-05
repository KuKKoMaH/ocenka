import * as API from "./api";
import Auth from "./Auth";

export default (orderId) => new Promise((resolve, reject) => {
  const loadOrder = () => API.getDraft(orderId, Auth.token).then(resolve, reject);

  Auth.getProfile()
    .then(loadOrder)
    .catch(() => {
      Auth.showLoginPopup().then(
        loadOrder,
        () => (window.location = '/')
      );
    });
});
