---
layout:     post
title:      "Q1 2023 RESTEasy Quarterly Releases"
subtitle:   ""
date:       March 01, 2023 11:11:11 PDT
author:     James R. Perkins
---

Today we announce some new RESTEasy releases. Given there was a low impact 
[CVE](https://access.redhat.com/security/cve/cve-2023-0482), we have released some older versions of RESTEasy as well.

One big change, that likely seems odd for a patch release, is the way [`OPTION`](https://issues.redhat.com/browse/RESTEASY-3283)
requests are handled. Previously a `DefaultOptionsMethodException` was thrown when invoked on a method that does not
contain an `@OPTIONS` annotation. This will now simply return a valid response instead of throwing the exception. The
old behavior can be enabled by setting the `dev.resteasy.throw.options.exception` configuration parameter to `true`.
This change happened in all the releases listed below.

## [6.2.3.Final]({{ site.baseurl }}/downloads#623final)

This is the latest release for the [Jakarta RESTful Web Services 3.1](https://jakarta.ee/specifications/restful-ws/3.1/) 
specification. The release consists mostly of bug fixes and component upgrades.

One component upgrade worth noting is the [Jackson Upgrade](https://issues.redhat.com/browse/RESTEASY-3295). The
Jackson components were upgraded from 2.13 to the latest 2.14. This was done as WildFly 28 will include 
[this upgrade](https://issues.redhat.com/browse/WFLY-17682) as well and the 
[RESTEasy 6.2.3.Final upgrade](https://issues.redhat.com/browse/WFLY-17638).

Full release notes for this release can be found [here](https://github.com/resteasy/resteasy/releases/tag/6.2.3.Final).

## [5.0.6.Final]({{ site.baseurl }}/downloads#506final)

This is the latest, and preferred, release for the 
[Jakarta RESTful Web Services 2.1](https://jakarta.ee/specifications/restful-ws/2.1/) specification. Except the 
above-mentioned [`OPTION`](https://issues.redhat.com/browse/RESTEASY-3283) change, this is primarily component
upgrades with a few bug fixes.

Full release notes for this release can be found [here](https://github.com/resteasy/resteasy/releases/tag/5.0.6.Final).

## [4.7.9.Final]({{ site.baseurl }}/downloads#479final)

This release targets the [Jakarta RESTful Web Services 2.1](https://jakarta.ee/specifications/restful-ws/2.1/) 
specification. This will likely be the final release from the 4.x stream. It was done primarily to resolve the CVE
mentioned previously. Except the above-mentioned [`OPTION`](https://issues.redhat.com/browse/RESTEASY-3283) change, this 
is primarily component upgrades with a few bug fixes.

Full release notes for this release can be found [here](https://github.com/resteasy/resteasy/releases/tag/4.7.9.Final)
and some [here](https://github.com/resteasy/resteasy/releases/tag/4.7.8.Final) as 4.7.8.Final introduced a bug.


## Finally

Not noted or available for a general download, there was a release of 3.15.6.Final what was done and is available in
Maven Central. This was done a SnakeYAML [CVE](https://access.redhat.com/security/cve/cve-2022-1471). This was an
important impact CVE. It only affects users using the `org.jboss.resteasy:resteasy-yaml-provider`. Full release notes
can be found [here](https://github.com/resteasy/resteasy/releases/tag/3.15.6.Final) and 
[here](https://github.com/resteasy/resteasy/releases/tag/3.15.5.Final).

As always, [feedback](https://github.com/resteasy/resteasy/discussions/) is welcome. Stay safe, and, depending on where 
you are, stay warm or be cool.
