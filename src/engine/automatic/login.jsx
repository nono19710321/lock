import React from 'react';
import Screen from '../../core/screen';
import SocialButtonsPane from '../../field/social/social_buttons_pane';
import LoginPane from '../../connection/database/login_pane';
import PaneSeparator from '../../core/pane_separator';
import {
  databaseConnection,
  defaultDatabaseConnection,
  hasScreen,
  signUpLink
} from '../../connection/database/index';
import { logIn as databaseLogIn } from '../../connection/database/actions';
import { renderSignedInConfirmation } from '../../core/signed_in_confirmation';
import LoginSignUpTabs from '../../connection/database/login_sign_up_tabs';
import * as l from '../../core/index';
import * as c from '../../field/index';
import { emailDomain } from '../../field/email';
import {
  logIn as enterpriseLogIn,
  startHRD
} from '../../connection/enterprise/actions';
import {
  defaultEnterpriseConnection,
  defaultEnterpriseConnectionName,
  findADConnectionWithoutDomain,
  isEnterpriseDomain,
  isHRDDomain
} from '../../connection/enterprise';
import SingleSignOnNotice from '../../connection/enterprise/single_sign_on_notice';
import { isSSOEnabled, usernameStyle } from '../automatic';


function shouldRenderTabs(m) {
  return l.hasSomeConnections(m, "database")
    && hasScreen(m, "signUp")
    && !isSSOEnabled(m);
}

const Component = ({model, t}) => {
  const sso = isSSOEnabled(model);
  const onlySocial = l.hasOnlyConnections(model, "social");

  const tabs = shouldRenderTabs(model)
    && <LoginSignUpTabs
         key="loginsignup"
         lock={model}
         loginLabel={t("loginLabel", {__textOnly: true})}
         signUpLink={signUpLink(model)}
         signUpLabel={t("signUpLabel", {__textOnly: true})}
       />;


  const social = l.hasSomeConnections(model, "social")
    && <SocialButtonsPane
         instructions={t("socialLoginInstructions")}
         lock={model}
         showLoading={onlySocial}
         signUp={false}
         t={t}
       />;

  const showPassword = !sso
    && (l.hasSomeConnections(model, "database")
       || !!findADConnectionWithoutDomain(model));

  const showForgotPasswordLink = showPassword
    && l.hasSomeConnections(model, "database");

  const loginInstructionsKey = social
    ? "databaseEnterpriseAlternativeLoginInstructions"
    : "databaseEnterpriseLoginInstructions";

  const login = (sso
    || l.hasSomeConnections(model, "database")
    || l.hasSomeConnections(model, "enterprise"))
    && <LoginPane
         emailInputPlaceholder={t("emailInputPlaceholder", {__textOnly: true})}
         forgotPasswordAction={t("forgotPasswordAction", {__textOnly: true})}
         instructions={t(loginInstructionsKey)}
         lock={model}
         passwordInputPlaceholder={t("passwordInputPlaceholder", {__textOnly: true})}
         showForgotPasswordLink={showForgotPasswordLink}
         showPassword={showPassword}
         usernameInputPlaceholder={t("usernameInputPlaceholder", {__textOnly: true})}
         usernameStyle={usernameStyle(model)}
       />;

  const ssoNotice = sso
    && <SingleSignOnNotice>
         {t("ssoEnabled", {__textOnly: true})}
       </SingleSignOnNotice>;

  const separator = social && login && <PaneSeparator/>;

  return <div>{ssoNotice}{tabs}{social}{separator}{login}</div>;

};

export default class Login extends Screen {

  constructor() {
    super("login");
  }

  renderAuxiliaryPane(lock) {
    return renderSignedInConfirmation(lock);
  }

  renderTabs(model) {
    return shouldRenderTabs(model);
  }

  submitHandler(model) {
    if (l.hasOnlyConnections(model, "social")) {
      return null;
    }

    if (isHRDDomain(model, c.email(model))) {
      return startHRD;
    }

    const useDatabaseConnection = !isSSOEnabled(model)
      && databaseConnection(model)
      && (defaultDatabaseConnection(model)
          || !defaultEnterpriseConnection(model));

    return useDatabaseConnection ? databaseLogIn : enterpriseLogIn;
  }

  render() {
    return Component;
  }

}