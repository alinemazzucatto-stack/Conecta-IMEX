// A liberação de outras contas exige alteração explícita da política e das regras.
(function () {
  'use strict';
  var ownerUid = 'qTyh5V0bOtewN4P7756FfsTuDMf1';
  var ownerEmail = 'aline.mazzucatto@imex.com.br';
  window.conectaAccessPolicy = Object.freeze({
    ownerEmail: ownerEmail,
    isAllowed: function (user) {
      return Boolean(user && user.uid === ownerUid &&
        String(user.email || '').trim().toLowerCase() === ownerEmail);
    }
  });
})();
