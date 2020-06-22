---
layout:     post
title:      "Trim WildFly To Run Restful Service With WildFly Galleon "
subtitle:   ""
date:       June 19, 2020
author:     Jim Ma
---
When we deploy Restful web service to WildFly Server, you might find that WildFly includes several components/subsystem your application doesn't actually use. Even these subsystems are lazily loaded, it's still consumes some disk spaces. Especially when moving to the cloud native architecture, we need the application server small size and start fast. WildFly Galleon project is created to install, uninstall or patch product with a xml customization definition or command line flags.  With this tool, we tell Gallon we only need JAX-RS functionality in my server and it will automatically install a trimmed WildFly version with only JAX-RS subsystem and all its dependencies. In this blog, we'll go through these steps to create a slimmed WildFly Server which only include Resteasy/jaxrs subystem to run Restful web service. 

### Install WildFly Galleon

The latest Gallon release is 4.2.5.Final, we download from [here](https://github.com/wildfly/galleon/releases/tag/4.2.5.Final). unzip and cli tool will be ready for use. When it gets the following result for the list-feature-pack command, it means the galleon tool installed successfully:

```
> galleon.sh list-feature-packs
=============== ============== ============ 
Product         Update Channel Latest Build 
=============== ============== ============ 
wildfly         current/final  20.0.0.Final 
wildfly         20.0/final     20.0.0.Final 
wildfly         19/final       19.1.0.Final 
wildfly         19.1/final     19.1.0.Final 
wildfly         19.0/final     19.0.0.Final 
wildfly         18.0/final     18.0.1.Final 
wildfly         20/final       20.0.0.Final 
wildfly         17.0/final     17.0.1.Final 
wildfly-core    11/final       11.1.1.Final 
wildfly-core    12/final       12.0.1.Final 
wildfly-core    current/final  12.0.1.Final 
wildfly-core    11.1/final     11.1.1.Final 
wildfly-core    12.0/final     12.0.1.Final 
wildfly-core    11.0/final     11.0.0.Final 
wildfly-core    10.0/final     10.0.3.Final 
wildfly-core    9.0/final      9.0.2.Final  
wildfly-servlet current/final  20.0.0.Final 
wildfly-servlet 20.0/final     20.0.0.Final 
wildfly-servlet 19/final       19.1.0.Final 
wildfly-servlet 19.1/final     19.1.0.Final 
wildfly-servlet 19.0/final     19.0.0.Final 
wildfly-servlet 18.0/final     18.0.1.Final 
wildfly-servlet 20/final       20.0.0.Final 
wildfly-servlet 17.0/final     17.0.1.Final 
```

### Install WildFly with jaxrs layer

Next step, we create a directory for the new trimmed WildFly installation with layers flag. Simply run this command to install a trimmed version WildFly which only includes jaxrs subsystem and it's dependent subsystems:

```
> galleon.sh install wildfly#20.0.0.Final  --layers=jaxrs --dir=/path/to/installation-dir
jaxrs-serverFeature-packs resolved. 
Feature-packs resolved. 
Packages installed. 
JBoss modules installed. 
Configurations generated. 
Feature pack installed.
======= ============ ============== 
Product Build        Update Channel 
======= ============ ============== 
wildfly 20.0.0.Final current      
```

In above command, **wildfly#20.0.0.Final** defines the wildfly version you want to install; **--layers=jaxrs** specify the layer you want to include in this installation, more layers can be provided with comma separated list. The **--dir** specify the destination folder to install.

After the installation, you'll get a customized WidlFly Version. the WildFly configuration file standalone.xml shows it only include these subsystems instead of whole bunch of things:
```
    <extensions>
        <extension module="org.jboss.as.deployment-scanner"/>
        <extension module="org.jboss.as.ee"/>
        <extension module="org.jboss.as.jaxrs"/>
        <extension module="org.jboss.as.naming"/>
        <extension module="org.wildfly.extension.io"/>
        <extension module="org.wildfly.extension.undertow"/>
    </extensions>
```
Besides the jaxrs subsystems in the installation, other subsystems are all jaxrs layer's dependent subsystem. For example , the undertow is the servlet container for jaxrs subsystem. Without undertow, jaxrs service won't work.

As we expect, this trimmed WildFly version should be small size, and the installation size is about 64.2 MB. Compare with WildFly server size 232 MB without trimming, it's relatively small. 

### Deploy your application deployment 

After the trimmed WildFly server is started, we can deploy service to see if all things work. 
Here we deploy this resource and application classes packaged in war file named with "resteasy.war":
```
@Path("/products")
public class ProductResource {
   @GET
   @Produces("application/json")
   public Jackson2Product[] getProducts() {

      Jackson2Product[] products = {new Jackson2Product(11, "RHEL"), new Jackson2Product(22, "EAP")};
      return products;
   }
   public class Jackson2Product {
       protected String name;

       protected int id;

       public Jackson2Product() {
       }

       public Jackson2Product(final int id, final String name) {
          this.id = id;
          this.name = name;
       }

       public String getName() {
          return name;
       }

       public void setName(String name) {
          this.name = name;
       }

       public int getId() {
          return id;
       }

       public void setId(int id) {
          this.id = id;
       }
    }
}
```
```
@Provider
@ApplicationPath("/")
public class ResteasyApplication extends Application {
}
```

When we send GET request to http://localhost:8080/resteasy/products, server responds with this simple json format message : **[{"id":11,"name":"RHEL"},{"id":22,"name":"EAP"}]** .

This jaxrs example resource doesn't require any other subsystem like CDI, messaging, jpa or transaction.\
When your application needs other layers or subsystems after the first installation, pass more layers values to galleon tool and run it again to install. Here is an example to add cdi layer to previous installation: 

```
> galleon.sh install wildfly#20.0.0.Final  --layers=jaxrs,cdi --dir=/path/to/installation-dir
```

WildFly provides rich layers for different application and purpose.The full list of layers can be found [here](https://docs.wildfly.org/20/Admin_Guide.html#wildfly-galleon-layers)

As you can see, Wildfly Galleon is a easy to use tool. Download and unzip are the two steps to get it ready. If you haven't, please give galleon a try to trim your Resteasy/jaxrs installation. If you have any issues and questions about jaxrs galleon layer, please contact Resteasy team. 













