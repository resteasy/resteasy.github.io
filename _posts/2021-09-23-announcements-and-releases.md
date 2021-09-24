---
layout:     post
title:       "RESTEasy Announcements and Plans"
subtitle:   ""
date:       September 23, 2021 11:11:11 PDT
author:     James R. Perkins
---

It's been a while since there has been a blog post announcing anything. However, there have been some big changes in
RESTEasy we would like to announce.

## Releases

The first announcement is the simple one. There has been two bug fix releases in [4.7.2.Final](https://issues.redhat.com/secure/ReleaseNote.jspa?projectId=12310560&version=12359560) 
and [3.15.2.Final](https://issues.redhat.com/secure/ReleaseNote.jspa?projectId=12310560&version=12356189).

## RESTEasy 4.7 is now part of WildFly! 

Starting with WildFly 25, RESTEasy has been upgraded to [4.7](https://issues.redhat.com/browse/WFLY-14812). For some
users this may require some migration changes. Overall it will include some much desired improvements.

## Changes

A lot has changed recently in RESTEasy. As announced in [July]({% post_url 2021-07-29-separate-spring-and-microprofile %}) the
MicroProfile REST Client, MicroProfile Config Sources and Spring have all ben split out of RESTEasy into their own
sub-projects.

Another module that has been removed from RESTEasy and moved to a sub-project is [`resteasy-cache-core`](https://issues.redhat.com/browse/RESTEASY-2999). This has been moved to the [`resteasy-exentions`](https://github.com/resteasy/resteasy-extensions)
project. For migration this will require a new Maven GAV, `org.jboss.resteasy.cache:cache-core`. A new 1.1.0.Final
version has been released for this.

The Google Guice (`resteasy-guice`) module has been [removed](https://issues.redhat.com/browse/RESTEASY-2967). There
is no replacement for this other than using Jakarta Context and Dependency Injection.

### Why has this been done?

We've done these things so that we can migrate to [Jakarta REST 3.0](https://jakarta.ee/specifications/restful-ws/3.0/)! 
While in terms of functionality Jakarta REST 3.0 does not introduce anything, it's the release that will change the 
namespace from `javax` to `jakarta`.

## What to expect for RESTEasy 5

RESTEasy 5 will be a Jakarta REST 2.1 implementation, same as 3.15.2.Final and 4.7.2.Final. Overall this will be very 
similar to 4.7 except the aforementioned removed/moved modules.

As of RESTEasy 5 there will no longer be a standalone RESTEasy distribution which includes a ZIP of JBoss Modules.
Instead, a Galleon Feature Pack can be used to install or upgrade RESTEasy on a provisioned WildFly server.

## What to expect for RESTEasy 6

RESTEasy 6 will target [Jakarta REST 3.0](https://jakarta.ee/specifications/restful-ws/3.0/). The only difference
between RESTEasy 5 and RESTEasy 6 will be the `javax` to `jakarta` namespace change. This includes upgrades to any
specifications which are part of [Jakarta EE 9.1](https://jakarta.ee/specifications/platform/9.1/).

## Other Announcements

We have enabled [discussions on GitHub](https://github.com/resteasy/resteasy/discussions) for those that want something
other than mailing lists.