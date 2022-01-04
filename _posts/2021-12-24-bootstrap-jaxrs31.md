---
layout:     post
title:      "Java SE Bootstrap API In Jakarta REST 3.1"
subtitle:   ""
date:       Dec 24, 2021
author:     Jim Ma
---
After JavaEE is moved under Eclipse foundation, there are a lot of things happens. 
The same things happened for Jakarta Restful Webservice specification. In previous 
Jakarta REST releases, there is no features added. But in Jakarta REST 3.1, there 
will be a lot of features included, Java SE Bootstrp API is one of the important 
features. In this post, we'll go through this new api with some examples and what will 
Resteasy do to support this new features. 

### Java SE Bootstrap API
From this api name, this allows the restful application to start in the Java SE 
environment. Use this api, it will internally start an embedded http server and
get the application ready to serve the incoming restful request. The key interface
of this feature classes is the ```SseBootStrap```.
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
It passes the application class and other http server configuration, the implementation will take care of other
things and start this restful application. It's very simple to start an application without packaging and deploying 
to a Jakarta EE container server like WildFly, Tomcat or Glassfish if you don't use other Jakarta EE features.
Especially, when you want to test the functionalities of the created restful resource class, this provides much easy 
api to do this job.

Java SE bootstrap api provides a configuration to accept the different options to configure the http server like protocol，
host, port, ssl configuration and rootPath. Please check this [example](https://github.com/eclipse-ee4j/jaxrs-api/blob/master/examples/src/main/java/jaxrs/examples/bootstrap/ExplicitJavaSeBootstrapExample.java) for more details. 

### Resteasy Bootstrap API Support
Since Resteasy 2.3.x, there is embedded container introduced for a test environment or a simple production enviroment
without introduces servlet dependencies. There are several embedded containers which are added with Resteasy's embedded
server plugin api interface:
 - Undertow
 - JDK HTTP Server
 - Netty
 - Reactor-Netty
 - Vert.x

All these embedded container implements Resteasy's [EmbeddedJaxrsServer](https://github.com/resteasy/resteasy/blob/5.0.1.Final/resteasy-core/src/main/java/org/jboss/resteasy/plugins/server/embedded/EmbeddedJaxrsServer.java) interface. 
Embedded container provides the implementation to start/stop container and "deploy" the deployment. Here is a Netty embedded container
example code to demonstrate start the restful service and client sends a request with these apis:
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
You may find these apis almost provides the same functionality apis with SeBootStrap api does. What we need to do 
is adapt Resteasy JDK HTTPServer embedded container to SeBootStrap api, and add this new api implementation in 
ResteasyProviderFactoryImpl like:
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
All these changes are pushed to [ee10 branch](https://github.com/resteasy/resteasy/tree/ee10）and main change happens class 
[ResteasyProviderFactoryImpl](https://github.com/resteasy/resteasy/blob/ee10/resteasy-core/src/main/java/org/jboss/resteasy/core/providerfactory/ResteasyProviderFactoryImpl.java#L1699

This is the features in development phrase and it could be changed in anytime. If you want to have a taste of what's this
new api looks like, please check out this branch and play with this api a bit. When you get any issues or questions, please 
talk with us on [Github Discussions](https://github.com/resteasy/resteasy/discussions).







