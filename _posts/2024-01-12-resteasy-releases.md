---
layout:     post
title:      "Q1 2024 RESTEasy Quarterly Releases"
subtitle:   ""
date:       January 12, 2024 11:11:11 PDT
author:     James R. Perkins
---

Today we'd like to announce a new RESTEasy releases and a new RESTEasy MicroProfile release.


## [6.2.7.Final]({{ site.baseurl }}/downloads#627final)

This is the latest release for the [Jakarta RESTful Web Services 3.1](https://jakarta.ee/specifications/restful-ws/3.1/) 
specification. The release consists mostly of bug fixes and component upgrades.

One bug fix worth noting is [RESTEASY-338](https://issues.redhat.com/browse/RESTEASY-3380). This is a exposure fix
if an error occurs with deserializing JSON with Jackson. This simply creates an `ExceptionMapper` which can be 
overridden by implementing an `ExceptionMapper<JsonProcessingException>` with a higher priority.

Full release notes for this release can be found [here](https://github.com/resteasy/resteasy/releases/tag/6.2.7.Final).

## RESTEasy MicroProfile 2.1.5.Final

This is the latest release for the [MicroProfile REST Client](https://download.eclipse.org/microprofile/microprofile-rest-client-3.0/microprofile-rest-client-spec-3.0.html).
This release includes component upgrades and bug fixes. Full release notes for this release can be found 
[here](https://github.com/resteasy/resteasy-microprofile/releases/tag/2.1.5.Final).

## Finally

As always, [feedback](https://github.com/resteasy/resteasy/discussions/) is welcome. Stay safe, and, depending on where 
you are, stay warm or be cool.
