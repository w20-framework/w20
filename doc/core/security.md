W20 applications can be integrated with security backends to authenticate users and display views that are consistent with
the backend security model. 

<div class="callout callout-warning">
<p>
Before going into details, <b>it is crucial to understand that a client-side Web application such as a W20 one can almost 
never provide effective security</b>. It is only a frontend that will reflect the security enforced in the backend, but
there is value in providing a consistent experience between what is possible in the UI and what is allowed by the 
backend and W20 provides such an integration.
</p>
</div> 

# The security model

## Subject and principals

The subject is the security term which refers to a security-centric view of an application user. It always have an
identifier. A particular W20 application instance can only have zero or one subject connected at a time.
Principals are key/value pairs associated to a subject and provide additional metadata about it, like its default culture,
its full name, its avatar, etc...

## Security providers

Security providers are the bridge between the backend and the W20 security model. Authentication operations are
done through security providers. 

### Simple authentication provider

W20 provides a `SimpleAuthenticationProvider` which is configured with two URL:
 
* an authentication URL which will be requested with a GET upon authentication and a DELETE upon deauthentication.
* an authorization URL which will be request with a GET upon successful authentication to retrieve subject authorizations.

The credentials will be passed in clear as query parameters upon authentication so it is recommended that this provider
is only used in the case of basic authentication where credentials can be omitted as they are directly handled by the
browser.

## Realms

Realms allow a W20 application to use several security backends at once. Security operations involving the backend(s)
like authentication will be done on all security realms. The multiple responses are checked for coherence (they must
all refer to the same subject id for instance) and are partially aggregated:

* Subject identity (like its identifier, type and principals) are merged as one definition,
* Subject authorizations are kept separate to avoid mixing backend security models. 

## Permissions

W20 security model is permission-based. Permissions are arrays of strings which denote a specific right to do something
in the application:

    [ 'admin', 'restart' ]
    [ 'admin', 'database', 'wipe' ]
    [ 'users', 'list', 'create,read,update' ]
    [ 'users', 'details', '*' ]
    [ 'printers', 'lp457', 'print' ]
    
Permission names are completely arbitrary and developer defined but it is recommended to start from the least-specific
term (like a "functional area" of the application or a use case) to the most specific term (like an action or an entity
identifier).

## Roles

Roles are simply collections of permissions and, although they can be checked for explicitly, it is not recommended for
the application security model maintainability. The recommendation is to design the permissions such as they express the
intent of the associated use case or user action and to check for these permissions only. It is guaranteed that as long
as the user action exists in the code the permission will remain semantically valid, whereas how it is given can change
throughout application life.

## Attributes

Attributes can be attached to roles and checked for during a permission or role check. It is mainly used to restrict
a role scope to a geographic region or an organisational branch for instance. 

# Configuration

The security module can be configured with the following options:

* `autoLogin` will automatically trigger an authentication upon application startup. In this case, security providers 
will be called without credentials. They can ask for credentials at this points or let the browser handle credential
entry (as it is the case in basic authentication for instance).
* `redirectAfterLogin` will redirect to the specified route path after a successful login. 
* `redirectAfterLogout` will redirect to the specified route path after a logout.
* `roleMapping` will allow to map multiple backend roles to uniquely named unified frontend roles.

## Role mapping

W20 security allows to map several backend roles to a unified frontend role which can then be used for display or
filtering purpose. It can be done through the `roleMapping` configuration attribute:

    "roleMapping": {
        "UNIFIED_ROLE": {
            "realm1": "SOME_BACKEND_ROLE",
            "realm2": "OTHER_BACKEND_ROLE"
        }
    }

This configuration enables to view the two backend roles, defined from two different realms as one frontend role 
called `UNIFIED_ROLE`. If only one security realm is declared in the application, all backend roles of this realm will
automatically be mapped to unified roles of the same name.  

# Fragment declaration

Security providers can be registered programatically with the authentication service but can also be declared in fragment
manifest:

    ...
    
    "security": {
        "provider": "Simple",
        "config": {
            "authentication": "...",
            "authorizations": "...
        }
    }
    
    ...
    
This will register a security realm with the name of the fragment identifier, using the `SimpleSecurityProvider` AngularJS
service as security provider configured with the `config` section.

# Security services

## Authentication service
 
The authentication service can be used to alter the currently connected subject:
 
* authenticate a new subject with its credentials and define it as the globally active subject, 
* deauthenticate the currently active subject,
* refresh the currently active subject.

The authentication service can also be used to query identity information about the subject, such as its identifier or
its principals.
  
## Authorization service

The authorization service can be used to verify specific authorizations on the currently active subject and on a specific
realm:

* if the subject has a specific role (with possibly specific attributes),
* if the subject has a specific permission (with possibly specific attributes).

It can also be used to query the list of roles, although it is limited to the unified roles.

## Security expression service

Security expressions are a simple and effective way of checking the authentication and authorization status of the
currently active subject. They are regular AngularJS expressions which can be evaluated in a specific context. Four 
operations are available:

* `hasPermission(realm, permission, attributes)` which checks a permission for the currently active subject,
* `hasRole(realm, role, attributes)` which checks if the currently active subject has a specific role,
* `isAuthenticated()` which checks if there is a currently active subject,
* `principal(name)` which returns the value of a specific principal

The result of the security expression is evaluated as a boolean.

# Security directive

The `w20Security` directive allows to evaluate a security expression in a view and display the element only if it
evaluates to true.

# Role filtering

W20 security can narrow the authorizations of the currently active subject by setting up filters:

* role filter narrows the authorizations to the specified roles. Any permission or role not allowed by the filter will
be denied until this filter is cancelled.
* attribute filter narrows the authorizations on which the specified attribute values are attached. Any permission
or role which don't have the specified attribute values will be denied until this filter is cancelled.

Filtering is limited to unified roles.

