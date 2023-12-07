---
layout:     post
title:      "RESTEasy Overview and Roadmap"
subtitle:   ""
date:       December 6, 2023 11:11:11 PDT
author:     James R. Perkins
---

As we look to 2024 I'd like to give an overview of the current RESTEasy Roadmap. Please note at this time there are not
specific timeframes for some of these tasks. We are reliant on the [Jakarta REST 4.0](https://jakarta.ee/specifications/restful-ws/4.0/)
going final before we can do any final releases.

## Jakarta REST 4.0

The current target for [Jakarta REST 4.0](https://jakarta.ee/specifications/restful-ws/4.0/){:target="_blank"} is Q1 of 2024. 
Jakarta REST 4.0  will bring some significant and breaking changes to the API and implementation. The biggest change 
will be the removal of the `@Context` injection and `jakarta.ws.rs.ext.ContextResolver`. These were deprecated for 
removal in [Jakarta REST 3.1](https://jakarta.ee/specifications/restful-ws/3.1/jakarta-restful-ws-spec-3.1#context-injection). 
RESTEasy 7.0 will [implement](https://issues.redhat.com/browse/RESTEASY-3379) the Jakarta REST 4.0 specification.

Given Jakarta REST 4.0 will hava a minimum require of Java SE 21, the main branch has been changed to require Java SE 21.

While RESTEasy 6.2 has seen better integration with CDI, Jakarta REST 4.0 will require even deeper integration. Some of
this is due to the `@Context` removal, but we like to have better CDI support in general.

## Testing Changes

While it's still a work in progress, we plan on [migrating testing](https://issues.redhat.com/browse/RESTEASY-3388) to
use JUnit 5. This will not affect consumers of RESTEasy, but we feel this will bring RESTEasy testing forward.

As an ongoing task is we'd like to introduce some [performance testing](https://issues.redhat.com/browse/RESTEASY-3430). 
Generally we rely on WildFly performance testing to know where RESTEasy stands. However, it would be good to be able 
to test RESTEasy, likely inside WildFly, on its own.

In [RESTEASY-3386](https://issues.redhat.com/browse/RESTEASY-3386) we introduce some testing in Kubernetes. The current
test is very basic and runs on the WildFly image. We would like to add more tests, including some for the `SeBootstrap`
in Kubernetes.

## New HTTP Client

We will be introducing a [new default backing HTTP Client](https://issues.redhat.com/browse/RESTEASY-1694) with
http/2 support. The backing client will be the JDK HTTP Client. This will have some minor caveats. One will be support
for the `ClientBuilder.hostnameVerifier()`. There is currently [no support](https://bugs.openjdk.org/browse/JDK-8213309){:target="_blank"}
for setting a `javax.net.ssl.HostnameVerifier` in the HTTP Client.

## Removal or Deprecations

Removing the JavaScript API for RESTEasy is being considered. This does not seem to be a popular dependency and is
becoming out of date. A decision needs to be made to remove support for this or update the JavaScript used.

The `org.jboss.resteasy:galleon-feature-pack` is likely to be [deprecated and removed](https://issues.redhat.com/browse/RESTEASY-3432).
The replacement will be a [WildFly Channel manifest](https://github.com/wildfly-extras/wildfly-channel/blob/d8642a52bcb67bc4c29428b3bc376d36d7f518a7/doc/spec.adoc).
This makes maintaining modules in WildFly much easier.

## Summary

Below are the highlights of the road map in no specific order:

* Implement the Jakarta REST 4.0 specification, [RESTEASY-3379](https://issues.redhat.com/browse/RESTEASY-3379)
* Add some more cloud testing, [RESTEASY-3386](https://issues.redhat.com/browse/RESTEASY-3386)
* Client HTTP/2 support, [RESTEASY-2802](https://issues.redhat.com/browse/RESTEASY-2802) and [RESTEASY-1694](https://issues.redhat.com/browse/RESTEASY-1694)
* Use JDK reactive return types, [RESTEASY-3429](https://issues.redhat.com/browse/RESTEASY-3429)
* More updates for gRPC support, [RESTEASY-2656](https://issues.redhat.com/browse/RESTEASY-2656)
* Performance testing, [RESTEASY-3430](https://issues.redhat.com/browse/RESTEASY-3430)
* Refactoring the [`ConfigurationFactory`](https://docs.google.com/document/d/1lEISSlw5GLHRFU8A0RFrs2R55qeunN1KN8t2qEWcYtQ/edit#heading=h.jwf7pylx1hke)
* Remove BouncyCastle dependency, [RESTEASY-3431](https://issues.redhat.com/browse/RESTEASY-3431)
* Migrate to JUnit 5, [RESTEASY-3388](https://issues.redhat.com/browse/RESTEASY-3388)
* Keep the JS API or update to remove deprecated code, currently no issue filed.
* Deprecate/remove the feature pack, [RESTEASY-3432](https://issues.redhat.com/browse/RESTEASY-3432)