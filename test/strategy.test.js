/* global describe, it, expect */
/* jshint expr: true */

var KeycloakStrategy = require('../lib/strategy')
  , chai = require('chai');

describe('strategy', function() {

  describe('constructed with undefined options', function() {
    it('should throw error', function() {
      expect(function() {
        var strategy = new KeycloakStrategy(undefined, function(){});
      }).to.throw(Error);
    });
  })

  describe('constructed with publicClient=true', function() {
    var strategy = new KeycloakStrategy({
      realm: 'myKeycloakRealm',
      authServerURL: 'https://keycloak.example.com/auth',
      clientID: 'ABC123',
      publicClient: 'true',
      callbackURL: 'http://www.example.com',
      sslRequired: 'none'
    }, function() {});

    it('should be named keycloak', function() {
      expect(strategy.name).to.equal('keycloak');
    });

    it('realm should be set to myKeycloakRealm', function() {
      expect(strategy.options.realm).to.equal('myKeycloakRealm', 'Unable to find the realm.');
    });

    it('publicClient should be set to true', function() {
      expect(strategy.options.publicClient).to.equal('true', 'Unable to find default publicClient.');
    });

    it('sslRequired should be set to none', function() {
      expect(strategy.options.sslRequired).to.equal('none', 'Unable to find default sslRequired.');
    });

    it('authorizationURL should be set', function() {
      expect(strategy.options.authorizationURL).to.equal('https://keycloak.example.com/auth/realms/myKeycloakRealm/protocol/openid-connect/auth');
    });

    it('tokenURL should be set', function() {
      expect(strategy.options.tokenURL).to.equal('https://keycloak.example.com/auth/realms/myKeycloakRealm/protocol/openid-connect/token');
    });

    it('_userProfileURL should be set', function() {
      expect(strategy._userProfileURL).to.equal('https://keycloak.example.com/auth/realms/myKeycloakRealm/protocol/openid-connect/userinfo');
    });
  })

  describe('constructed with publicClient=false, but clientSecret equals to null', function() {
    it('should throw error', function() {
      expect(function() {
        var strategy = new KeycloakStrategy({
          realm: 'myKeycloakRealm',
          authServerURL: 'https://keycloak.example.com/auth',
          clientID: 'ABC123',
          publicClient: 'false',
          callbackURL: 'http://www.example.com',
          sslRequired: 'none'
        }, function(){});
      }).to.throw(Error);
    });
  })

  describe('constructed with publicClient=false and clientSecret', function() {
    var strategy = new KeycloakStrategy({
      realm: 'myKeycloakRealm',
      authServerURL: 'https://keycloak.example.com/auth',
      clientID: 'ABC123',
      publicClient: 'false',
      clientSecret: 'mySecret',
      callbackURL: 'http://www.example.com',
      sslRequired: 'none'
    }, function() {});

    it('clientSecret should be set to mySecret', function() {
      expect(strategy.options.clientSecret).to.equal('mySecret', 'Unable to find default clientSecret.');
    });
  })

});