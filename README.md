# passport-keycloak-oauth2-oidc

[Passport](http://passportjs.org/) strategy for authenticating with [Keycloak](http://www.keycloak.com/)
using the OAuth2/OIDC API.

This module lets you authenticate using Keycloak in your Node.js applications.
By plugging into Passport, Keycloak authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

```bash
$ npm install passport-keycloak-oauth2-oidc
```

## Usage

### Create an Application

Before using `passport-keycloak-oauth2-oidc`, you must create a `realm` and `client` with your Keycloak.

### Configure Strategy

The Keycloak authentication strategy authenticates requests by delegating to
your Keycloak server using the OpenID Connect (OIDC/OAuth 2.0) protocol.

When using this strategy, it's AuthorizationURL and
TokenURL options are generated based on the `authServerURL` and
`realm` options. You can find these two option values
from the `Applications->Installation` section, or from the
`OAuth Clients->Installation` section in your keycloak realm.

Applications must supply a `verify` callback which accepts an `accessToken`,
`refreshToken` and service-specific `profile`, and then calls the `done`
callback supplying a `user`, which should be set to `false` if the
credentials are not valid.  If an exception occured, `err` should be set.

Options:

- `realm`            Name of your KeyCloak realm (set to `master` by default).
- `authServerURL`    Base URL for you Realm authorization endpoint.
- `publicClient`     If your Keycloak client's `Access Type` is set to `public` (`publicClient` set to `true` by default).
- `clientID`         This will match your `Application Name`, `resource` or `OAuth Client Name`.
- `clientSecret`     If your Keycloak client's `Access Type` is set to `confidential` this is required (`publicClient` set to `false`).
- `callbackURL`      URL to which KeyCloak will redirect the user after granting authentication.
- `sslRequired`      requires SSL for (all|external|none) requests (set to `external` by default).

Examples:

```javascript
  var KeyCloakStrategy = require('passport-keycloak-oauth2-oidc').Strategy;
  passport.use(new KeyCloakStrategy({
      clientID: 'myOauthClient',
      realm: 'MyKeyCloakRealm',
      publicClient: 'false',
      clientSecret: '6ee0f303-faef-42d7-ba8e-00cdec755c42',
      sslRequired: 'external',
      authServerURL: 'https://keycloak.example.com/auth',
      callbackURL: 'https://www.example.com/keycloak/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOrCreate(..., function err, user) {
        done(err, user);
      });
    }
  });
```

### Authenticate Requests

Use `passport.authenticate()`, specifying the `'keycloak'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```javascript
app.get('/auth/keycloak',
  passport.authenticate('keycloak', { scope: ['profile'] }));

app.get('/auth/keycloak/callback', 
  passport.authenticate('keycloak', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
  ```

### How to get Roles

By default, Keycloak returns Roles information within AccessToken.

If you are wondering to fetch Roles (e.g. realm_access roles, resource_access roles etc) within UserInfo endpoint, please make sure that Keycloak returns those claims .

To add these claims to the UserInfo endpoint, edit the `roles` settings in the Client Scopes:

Clients Scopes -> roles -> settings:

- name: roles
- Include In Token Scope: enable

and in the `client roles` mappers settings, an example mapping :

- name: client roles
- mapper type: user client role
- multivalued: on
- token claim name: roles.resource_access.${client_id}.roles
- claim JSON type: string
- add to userinfo: enabled

## License

[The MIT License](http://opensource.org/licenses/MIT)
