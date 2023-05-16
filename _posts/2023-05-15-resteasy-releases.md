---
layout:     post
title:      "Q2 2023 RESTEasy Quarterly Releases"
subtitle:   ""
date:       May 15, 2023 21:11:11 PDT
author:     James R. Perkins
---

Today we announce some new RESTEasy releases. These are the 2023 Q2 releases. There have been two releases; 5.0.7.Final
and 6.2.4.Final.

## [6.2.4.Final]({{ site.baseurl }}/downloads#624final)

This is the latest release for the [Jakarta RESTful Web Services 3.1](https://jakarta.ee/specifications/restful-ws/3.1/) 
specification. The release consists mostly of bug fixes and component upgrades.

One component upgrade worth noting is the [Undertow Upgrade](https://issues.redhat.com/browse/RESTEASY-3323). There was
a moderate CVE, [CVE-2022-4492](https://access.redhat.com/security/cve/cve-2022-4492), fixed in Undertow. Unfortunately,
due to [UNDERTOW-2167](https://issues.redhat.com/browse/UNDERTOW-2167), there was not a 2.2.x release with the CVE fix
which would work with Serlvlet 5.0. This required an upgrade to Servlet 6.0.

Full release notes for this release can be found [here](https://github.com/resteasy/resteasy/releases/tag/6.2.4.Final).

## [5.0.7.Final]({{ site.baseurl }}/downloads#507final)

This is the latest, and preferred, release for the 
[Jakarta RESTful Web Services 2.1](https://jakarta.ee/specifications/restful-ws/2.1/) specification. This release 
is primarily component upgrades with a few bug fixes.

Full release notes for this release can be found [here](https://github.com/resteasy/resteasy/releases/tag/5.0.7.Final).


## Finally

As always, [feedback](https://github.com/resteasy/resteasy/discussions/) is welcome. Stay safe, and, depending on where 
you are, stay warm or be cool.
