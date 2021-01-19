---
layout:     post
title:       ""
subtitle:   ""
date:       Jan 18th, 2021
author:     Wei Nan
---

There was [request](https://issues.redhat.com/browse/WFLY-7419) to include RESTEasy WADL module into WildFly by default. While the issue is under discussion, we can have an example showing how to deploy the RESTEasy WADL module by yourself into WildFly.

To achieve the goal, firstly we need to add the `resteasy-wadl` as the dependency of the project we want to deploy to WildFly. And if the project is using Maven, here is the configuration need be put into `pom.xml`:

```xml
<dependency>
   <groupId>org.jboss.resteasy</groupId>
   <artifactId>resteasy-wadl</artifactId>
   <version>${resteasy.ver}</version>
</dependency>
```

In above config, the `${resteasy.ver}` is the RESTEasy version you used in your project. Because WildFly has its own RESTEasy module, so I recommend that the project to use the same RESTEasy version used by your WildFly server.

To check the RESTEasy version used by your WildFly, you can check your WildFly's `module` directory like this:

```bash
$ ls modules/system/layers/base/org/jboss/resteasy/resteasy-jaxrs/main/
module.xml
resteasy-client-3.14.0.Final.jar
resteasy-jaxrs-3.14.0.Final.jar
resteasy-tracing-api-1.0.0.Final.jar
$
```

From the above output, we can see the WildFly on my machine is using RESTEasy `3.14.0.Final` by default. So the `resteasy-wadl` module you used better to keey sync with it, or there *may* have incompatible issues.

Another possible solution is to upgrade the RESTEasy modules inside WildFly, this way you can use the newest RESTEasy releases, and here is the document describing how to do it:

* [Upgrading RESTEasy within WildFly](https://docs.jboss.org/resteasy/docs/4.5.8.Final/userguide/html_single/index.html#upgrading-wildfly)

Please note the above solution maybe *unsafe*, because the resteasy-module version may not be integrated and tested by WildFly team yet.

Above is the WildFly side that needs to be noted. Coming back to the project side, here is the sample code to enable the `resteasy-wadl` module:

```java
import org.jboss.resteasy.wadl.ResteasyWadlDefaultResource;
import org.jboss.resteasy.wadl.ResteasyWadlWriter;

import javax.ws.rs.Path;

@Path("/")
public class MyWadlResource extends ResteasyWadlDefaultResource {

    public MyWadlResource() {
        ResteasyWadlWriter.ResteasyWadlGrammar wadlGrammar = new ResteasyWadlWriter.ResteasyWadlGrammar();
        wadlGrammar.enableSchemaGeneration();
        getWadlWriter().setWadlGrammar(wadlGrammar);

    }
}
```

The above sample class will enable the `resteasy-wadl` module and register its service at root URL '/'. In addition, it enables the WADL grammar support.

To see the detail usage and source code of the example, please check the sample here inside the `resteasy-examples` project:

* [An example showing how to deploy resteasy-wadl based project to WildFly](https://github.com/resteasy/resteasy-examples/blob/master/resteasy-wadl-wildfly/README.md)

If you've met any problems during its usage, please feel free to submit issue report at: 

* [RESTEasy Issue Report](https://issues.redhat.com/projects/RESTEASY/summary)

Enjoy!





