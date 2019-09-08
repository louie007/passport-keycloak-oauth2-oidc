// Load modules
var OAuth2Strategy = require('passport-oauth2')
  , util = require('util')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError
  , UserInfoError = require('./user-info-error');

/**
 * `Strategy` constructor
 *
 * The Keycloak authentication strategy authenticates requests by delegating to
 * your Keycloak server using the OpenID Connect (OIDC/OAuth 2.0) protocol.
 *
 * When using this strategy, it's AuthorizationURL and
 * TokenURL options are generated based on the `authServerURL` and
 * `realm` options. You can find these two option values
 * from the `Applications->Installation` section, or from the 
 * `OAuth Clients->Installation` section in your keycloak realm.
 * 
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `realm`            Name of your KeyCloak realm (set to `master` by default).
 *   - `authServerURL`    Base URL for you Realm authorization endpoint.
 *   - `publicClient`     If your Keycloak client's `Access Type` is set to `public` (`publicClient` set to `true` by default).
 *   - `clientID`         This will match your `Application Name`, `resource` or `OAuth Client Name`.
 *   - `clientSecret`     If your Keycloak client's `Access Type` is set to `confidential` this is required (`publicClient` set to `false`).
 *   - `callbackURL`      URL to which KeyCloak will redirect the user after granting authentication.
 *   - `sslRequired`      requires SSL for (all|external|none) requests (set to `external` by default).
 * 
 * Examples:
 *     passport.use(new KeyCloakStrategy({
 *        clientID: 'myOauthClient',
 *        realm: 'MyKeyCloakRealm',
 *        publicClient: 'false',
 *        clientSecret: '6ee0f303-faef-42d7-ba8e-00cdec755c42',
 *        sslRequired: 'external',
 *        authServerURL: 'https://keycloak.example.com/auth',
 *        callbackURL: 'https://www.example.com/keycloak/callback'
 *      },
 *      function(accessToken, refreshToken, profile, done) {
 *        User.findOrCreate(..., function err, user) {
 *          done(err, user);
 *        });
 *      }
 *    });
 * 
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */
function Strategy(options, verify) {
  options = options || {};
  options.realm = options.realm || 'master';

  // set publicClient to `true` by default
  if (options.publicClient != 'false') {
    options.publicClient = 'true';
  }

  // set sslRequired to `external` by default
  if (options.sslRequired != 'all' && options.sslRequired != 'none') {
    options.sslRequired = 'external';
  }

  // encode realm
  options.realm = encodeURIComponent(options.realm);

  if (!options.authServerURL) {
    throw new Error('Keycloak authServerURL is required.');
  }

  if (!options.callbackURL) {
    throw new Error('Keycloak callbackURL is required.');
  }

  if (!options.clientSecret && options.publicClient == 'false') {
    throw new Error('Keycloak clientSecret is required.');
  }

  var encodeRealm = encodeURIComponent(options.realm);

  options.authorizationURL = `${options.authServerURL}/realms/${options.realm}/protocol/openid-connect/auth`;
  options.tokenURL = `${options.authServerURL}/realms/${options.realm}/protocol/openid-connect/token`;

  OAuth2Strategy.call(this, options, verify);
  
  this.options = options;
  this.realm = options.realm;
  this.name = 'keycloak';
  this._userProfileURL = `${options.authServerURL}/realms/${options.realm}/protocol/openid-connect/userinfo`;
}

// Inherit from `OAuth2Strategy`
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Keycloak
 *
 * This function returns user profile information
 * The fields that are returned are dependent on
 * the Allowed Claims for the OAuth client that is
 * connecting.
 * 
 *   - `provider`         always set to `keycloak`
 *   - `id`
 *   - `username`
 *   - `displayName`
 *   - `realm`            keycloak realm
 *
 * @param {string} accessToken
 * @param {function} done
 * @access protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  var self = this;
  this._oauth2._useAuthorizationHeaderForGET = true;
  this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
    var json;

    if (err) {
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
      }

      if (json && json.error && json.error.message) {
        return done(new UserInfoError(json.error.message, json.error.code));
      } else if (json && json.error && json.error_description) {
        return done(new UserInfoError(json.error_description, json.error));
      }
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }

    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }

    var profile = { realm: self.options.realm, provider: 'keycloak' };
    profile.id = json.sub;
    profile.username = json.preferred_username;
    profile.email = json.email || '';
    profile.name = json.name || '';
    profile.given_name = json.given_name || '';
    profile.given_name = json.family_name || '';
    profile.email_verified = json.email_verified || '';
    profile.roles = json.roles || '';

    // profile._raw = body;
    profile._json = json;

    done(null, profile);
  });
}

/**
 * Expose `Strategy`
 */
module.exports = Strategy;
