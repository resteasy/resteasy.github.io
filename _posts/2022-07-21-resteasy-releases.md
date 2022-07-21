---
layout:     post
title:      "RESTEasy Releases"
subtitle:   ""
date:       July 21, 2022 11:11:11 PDT
author:     James R. Perkins
---

It is once again time for the next quarterly releases of RESTEasy. There have been releases of the following 4 streams:

* [6.1.0.Beta3](https://github.com/resteasy/resteasy/releases/tag/6.1.0.Beta3){:target="_blank"}
* [6.0.3.Final](https://github.com/resteasy/resteasy/releases/tag/6.0.3.Final){:target="_blank"}
* [5.0.4.Final](https://github.com/resteasy/resteasy/releases/tag/5.0.4.Final){:target="_blank"}
* [4.7.7.Final](https://github.com/resteasy/resteasy/releases/tag/4.7.7.Final){:target="_blank"}

### RESTEasy 6.1.0.Beta3

Version 6.1.0.Beta3 targets [Jakarta RESTful Web Services 3.1](https://jakarta.ee/specifications/restful-ws/3.1/) and
is passing the Jakarta RESTful Web Services TCK 3.1 with WildFly. This is currently the active release stream.

While currently there is no set date for 6.1.0.Final please note it will be in the near future.

Also, with this release comes a new project for [RESTEasy Quickstarts](https://github.com/resteasy/resteasy-quickstarts).
This replaces the previous RESTEasy Examples which target older versions of Jakarta RESTful Web Services.

Full release notes for this release can be found [here](https://issues.redhat.com/secure/ReleaseNote.jspa?projectId=12310560&version=12385173).

### RESTEasy 6.0.3.Final

Wait, what happened to 6.0.2.Final? Well, the release got messed up. It was deployed to JBoss Nexus and Maven Central, 
but it's missing commits. Therefore, a 6.0.3.Final version was released.

This release targets [Jakarta RESTful Web Services 3.0](https://jakarta.ee/specifications/restful-ws/3.0/). This version
of Jakarta RESTful Web Services is equivalent to 2.1 except the `jakarta` namespace vs the `javax` namespace. This
may end up being the last release of this stream in favor of 6.1.

Full release notes for this release can be found [here](https://issues.redhat.com/secure/ReleaseNote.jspa?projectId=12310560&version=12385157).

### RESTEasy 5.0.4.Final

This release targets [Jakarta RESTful Web Services 2.1](https://jakarta.ee/specifications/restful-ws/2.1/). Going
forward this will be release stream for Jakarta REST 2.1. However, no new features will be added here.

Full release notes for this release can be found [here](https://issues.redhat.com/secure/ReleaseNote.jspa?projectId=12310560&version=12385156).

### RESTEasy 4.7.7.Final

Like 5.0.4.Final, this release targets [Jakarta RESTful Web Services 2.1](https://jakarta.ee/specifications/restful-ws/2.1/).
The difference is the 4.7 release stream still includes RESTEasy Spring and RESTEasy MicroProfile artifacts. These
artifacts still exist under different projects. For RESTEasy MicroProfile the new project is 
[resteasy-microprofile](https://github.com/resteasy/resteasy-microprofile){:target="_blank"}. For RESTEasy Spring the
new project is [resteasy-spring](https://github.com/resteasy/resteasy-spring){:target="_blank"}.

This is likely the last release for this stream in favor of using 5.0 and the separate release streams for
RESTEasy MicroProfile and RESTEasy Spring.

Full release notes for this release can be found [here](https://issues.redhat.com/secure/ReleaseNote.jspa?projectId=12310560&version=12385154).
