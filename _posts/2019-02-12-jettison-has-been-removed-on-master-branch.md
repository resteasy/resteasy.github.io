---
layout:     post
title:       "Jettison has been removed on master branch"
subtitle:   ""
date:       Feb 12, 2019 9:01:00 AM
author:     Weinan Li
---

We have removed `resteasy-jettison-provider` from master branch, and here is the tracker bug on this change: 

[https://issues.jboss.org/browse/RESTEASY-1316](https://issues.jboss.org/browse/RESTEASY-1316)

The major affect is that the `resteasy-link` module is now dependent on `resteasy-jackson2-provider` to replace `resteasy-jettison-provider` to support JAXB annotation -&gt; JSON data marshaling.

In addition, Jackson2 has some subtle differences on supporting JAXB annotations comparing with the default JAXB or Jettison marshallers. So some `resteasy-link` test classes are adjusted to accommodate this change. Here is the relative PR that shows the difference after the migration: 

[https://github.com/resteasy/resteasy/pull/1850/files#diff-a873f7dcbc6d4b04d29b4f0dd1015f76R17](https://github.com/resteasy/resteasy/pull/1850/files#diff-a873f7dcbc6d4b04d29b4f0dd1015f76R17)

The above change shows the changes in JAXB annotations after changing the JAXB -&gt; JSON provider to `resteasy-jackson2-provider` for `resteasy-link` module.

Above is the summary of Jettison removal.




                    




                    

                    


                
