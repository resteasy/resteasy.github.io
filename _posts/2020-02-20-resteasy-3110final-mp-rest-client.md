---
layout:     post
title:      "RESTEasy 3.11.0.Final: MicroProfile REST Client 1.4; Client memory management"
subtitle:   ""
date:       Feb 20, 2020 00:45:00
author:     Ron Sigal
---
Originally, RESTEasy 3.10.0.Final was intended to ship with Wildfly 19, but WF 19, along with a number of upstream projects 
including RESTEasy, was held back to enable supporting the forthcoming MicroProfile 3.3 umbrella project, which includes [MicroProfile REST Client 1.4](https://projects.eclipse.org/projects/technology.microprofile/releases/rest-client-1.4/). Consequently,
RESTEasy 3.11.0.Final was released with minor changes that support MP REST Client 1.4. The
only relevant substantive change is the requirement that any implementation of MP REST Client must, in the case that
CDI is active in the environment, support CDI injection into any implementation of the interface ClientHeadersFactory.
RESTEasy does that and passes the updated TCK.

Release 3.11.0.Final also includes some memory management improvements in the client environment, as described in
["Reduce memory pressure while inheriting client configuration"](https://issues.redhat.com/browse/RESTEASY-2302), 

For release notes, see [RESTEasy 3.11.0.Final](https://issues.redhat.com/secure/ReleaseNote.jspa?version=12343301&styleName=Html&projectId=12310560&Create=Create&atl_token=AQZJ-FV3A-N91S-UDEU_b298dd8ed3dced33c98f12b1739760bc1706034e_lin)