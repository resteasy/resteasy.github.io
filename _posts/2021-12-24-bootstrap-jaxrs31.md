---
layout:     post
title:      "Java SE Bootstrap API In Jakarta REST 3.1"
subtitle:   ""
date:       Dec 24, 2021
author:     Jim Ma
---
After JavaEE was moved under Eclipse Foundation, we started seeing many changes on the specifications;
the Jakarta Restful Webservice specification group in particular is fairly active.
With Jakarta REST 3.1, there will be a lot of new features included and the Java SE Bootstrap API is among the most important ones.
In this post, we'll go through this new api with some examples and explain RESTEasy will 
do to support this new feature.

### Java SE Bootstrap API
As the API name suggests, this allows a restful application to start in the Java SE 
environment. When using this api, an embedded http server will be started and
an application automatically deployed on it to serve the incoming restful request.
The key interface of this feature classes is the ```SeBootStrap```.
```
public interface SeBootstrap {
    ...
    /**
     * Starts the provided application using the specified configuration. Creates application instance
     * from class using default constructor. Injection is not supported.
     *
     * <p>
     * This method is intended to be used in Java SE environments only. The outcome of invocations in Jakarta EE container
     * environments is undefined.
     * </p>
     *
     * @param clazz The application class.
     * @param configuration Provides information needed for bootstrapping the application.
     * @return {@code CompletionStage} (possibly asynchronously) producing handle of the running application
     * {@link SeBootstrap.Instance instance}.
     * @see Configuration
     * @since 3.1
     */
    static CompletionStage<Instance> start(final Class<? extends Application> clazz, final Configuration configuration) {
        return RuntimeDelegate.getInstance().bootstrap(clazz, configuration);
    }
```
It allows setting the application class and other http server configuration; the implementation will take care of other
things and start the restful application. It's very simple to start an application without packaging and deploying 
to a Jakarta EE container server like WildFly, Tomcat or Glassfish if you don't use other Jakarta EE features.
This is very convenient especially when you want to test the functionalities of the created restful resource class.

Java SE bootstrap api provides a configuration to accept the different options to configure the http server like protocol，
host, port, ssl configuration and rootPath. Please check this [example](https://github.com/eclipse-ee4j/jaxrs-api/blob/master/examples/src/main/java/jaxrs/examples/bootstrap/ExplicitJavaSeBootstrapExample.java) for more details. 

### RESTEasy Bootstrap API Support
Since RESTEasy 2.3.x, there is embedded container introduced for a test environment or a simple production enviroment
without any servlet dependencies. Several embedded container implementations of the server plugin api interface are available:
 - Undertow
 - JDK HTTP Server
 - Netty
 - Reactor-Netty
 - Vert.x

All these embedded container implements RESTEasy's [EmbeddedJaxrsServer](https://github.com/resteasy/resteasy/blob/5.0.1.Final/resteasy-core/src/main/java/org/jboss/resteasy/plugins/server/embedded/EmbeddedJaxrsServer.java) interface. 
Each embedded container provides the implementation to start/stop the container and "deploy" the deployment. Here is a Netty embedded container
example code to demonstrate how the restful service is started through these APIs and interacts with a client sending requests:
```
      NettyJaxrsServer server = null;
      Client client = null;
      try
      {
         ResteasyDeployment deployment = new ResteasyDeploymentImpl();
         Application app = new TestApplication();
         deployment.setApplication(app);
         server = new NettyJaxrsServer();
         server.setDeployment(deployment);
         server.setHostname("localhost");
         server.setPort(8080);
         server.start();

         // call resource
         final String path = "/rest-test/echo";
         client = ClientBuilder.newClient();
         String url = String.format("http://%s:%d%s", server.getHostname(), server.getPort(), path);
         Response response = client.target(url).queryParam("text", ECHO).request().get();
         assertTrue(response.getStatus() == HttpResponseCodes.SC_OK);
         String msg = response.readEntity(String.class);
         assertEquals(ECHO, msg);
      }
      finally
      {
         if (client != null)
         {
            client.close();
         }
         if (server != null)
         {
            server.stop();
         }
      }
```
As you can see, these APIs basically provide the same functionality offered by the SeBootStrap API. Implementing the new Jakarta REST API is hence a matter of 
adaptapting the RESTEasy JDK HTTPServer embedded container to the SeBootStrap API and properly modifying the ResteasyProviderFactoryImpl:
```
@Override
   public CompletionStage<SeBootstrap.Instance> bootstrap(Application application,
           SeBootstrap.Configuration configuration) {
      return CompletableFuture.supplyAsync(new Supplier<SeBootstrap.Instance>()
      {

         @Override
         public SeBootstrap.Instance get()
         {
            SunHttpJaxrsServer server = new SunHttpJaxrsServer();
            server.setPort(configuration.port());
            server.setHost(configuration.host());
            server.setRootResourcePath(configuration.rootPath());
            if (configuration.sslContext() != null)
            {
               SSLParameters sslParams = configuration.sslContext().getDefaultSSLParameters();
               if (configuration.sslClientAuthentication() == SeBootstrap.Configuration.SSLClientAuthentication.NONE)
               {
                  sslParams.setNeedClientAuth(false);
               }
               if (configuration.sslClientAuthentication() == SeBootstrap.Configuration.SSLClientAuthentication.OPTIONAL)
               {
                  sslParams.setWantClientAuth(true);
               }
               if (configuration.sslClientAuthentication() == SeBootstrap.Configuration.SSLClientAuthentication.MANDATORY)
               {
                  sslParams.setNeedClientAuth(true);
               }
               server.setSSLContext(configuration.sslContext());
            }
            server.setProtocol(configuration.protocol());
            ResteasyDeployment deployment = new ResteasyDeploymentImpl();
            deployment.setApplication(application);
            server.setDeployment(deployment);
            server.start();
            return new SeBootstrap.Instance()
            {
               @Override
               public SeBootstrap.Configuration configuration()
               {
                  return configuration;
               }

               @Override
               public CompletionStage<StopResult> stop()
               {
                  return CompletableFuture.supplyAsync(new Supplier<StopResult>() {
                     @Override
                     public StopResult get()
                     {
                        server.stop();
                        return new StopResult() {

                           @Override
                           public <T> T unwrap(Class<T> nativeClass)
                           {
                              //TODO:implement this;
                              return null;
                           }

                        };
                     }

                  });
               }

               @Override
               public <T> T unwrap(Class<T> nativeClass)
               {
                  return null;
               }

            };
         }
      });
   }

```
All these changes are pushed to [ee10 branch](https://github.com/resteasy/resteasy/tree/ee10) and main change happens in class 
[ResteasyProviderFactoryImpl](https://github.com/resteasy/resteasy/blob/ee10/resteasy-core/src/main/java/org/jboss/resteasy/core/providerfactory/ResteasyProviderFactoryImpl.java#L1699).

This features is still in development phase and fixes / improvements might still be required. If you want to have a taste of what's coming with this
new api, please check out this branch and play with this api a bit. When you get any issues or questions, please 
talk with us on [Github Discussions](https://github.com/resteasy/resteasy/discussions).







