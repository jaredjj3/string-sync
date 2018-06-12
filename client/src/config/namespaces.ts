const configureNamespaces = () => {
  window.ss = window.ss || {};

  // auth
  window.ss.auth = undefined;
  window.ss.sessionSync = { callback: undefined, user: {} };

  // antd message and notification
  window.ss.message = undefined;
  window.ss.notification = undefined;
};

export default configureNamespaces;
