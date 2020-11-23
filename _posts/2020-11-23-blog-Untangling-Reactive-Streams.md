---
layout:     post
title:      "Untangling Reactive Streams' Gordian Knot, Wiring Subscriber, Publisher and Subscription"
subtitle:   ""
date:       Nov 23, 2020 
author:     Rebecca Searls
---

At first look the Reactive Streams 1.0 Specification and its four short interfaces
look straight forward to learn but libraries that implement Reactive Streams must
provide a lot of infrastructure to enable it to work in the manner intended by the
specification.  These additions add a layer of complexity to the learning process.
This article will strip away some of these complexities and look at the bare bones
wiring of a Subscriber to a Publisher and Subscription.  I will be using the RxJava
version 3.0 implementation for this discussion.

The demo code provided here can be found in github project [untangling-reactive-streams](https://github.com/rsearls/blog-posts).

From the Reactive Streams Specification here are the three interfaces of interest.

````
      public interface Publisher<T> {
          public void subscribe(Subscriber<? super T> s);
      }

      public interface Subscriber<T> {
          public void onSubscribe(Subscription s);
          public void onNext(T t);
          public void onError(Throwable t);
          public void onComplete();
      }

      public interface Subscription {
          public void request(long n);
          public void cancel();
      }
````

A publisher object provides an "unbounded sequence of elements".  The purpose
of the Publisher interface is to provide a means for a subscriber to register
itself with the object.  A publisher requires a means to pass data to the
subscriber, notify it of errors and notify it when a terminal state has been 
reached. To that end, the Subscriber interface provides methods, ```onNext```, 
```onError``` and ```onComplete``` respectively to be called by the publisher.

A subscription is issued by a publisher to a subscriber as part of the registration
process.  It represents a one-to-one relationship between the publisher and subscriber.
In reactive the publisher can send data at intervals that are too fast for the
subscriber to handle.  Subscription provides the means for data flow regulation
to be communicated from the subscriber to the publisher.  The subscriber can 
adjust the flow rate during the life of the subscription.  The subscriber also 
uses the Subscription object to cancel the subscription with the publisher. 

Here is a very simple example that shows how these components are wired together.
There is synchronous data flow between the publisher and subscriber to keep it simple.
The subscriber will toggle the flow rate between 1 and 2 items at a time
during the run.  Data flow will terminate normally (i.e. ```onComplete``` will
be called).  I will point out what I think are the essential rules from the
specification that pertain to the basic wiring of these components.  There
are many implementation rules to fully implementing these interfaces, but
those are addressed better in other articles. I am using POJOs rather than
lambdas because I think it easier to see what is occurring.

NewsPublisher is a fictitious clearing house for all types of publications.  It sends
the publications to the subscriber as it receives them.  For this example there
is a fixed set of publication titles.  A Stack is used to mimic data streaming.

The Reactive Streams Specification mandates that the first thing ```Publisher.subscribe```
must do is call ```Subscriber.onSubscribe```, (Publisher rule 9).  This allows the 
subscriber to perform any initialization it needs before receiving data.  This 
initialization includes the subscriber calling ```Subscription.request``` to set 
the data flow rate.
In this example once the subscriber has completed its initialization the publisher
starts sending data.  The while loop in method ```sendData``` checks the flow rate
designed by the subscriber.  The for loop sends that number of data items requested.

````
public class NewsPublisher implements Publisher<String> {
    private Subscriber subscriber;
    private NewsSubscription subscription;

    private List<String> articles = List.of(
            "NASA Notables",
            "The Gardian",
            "Soccer Weekly",
            "Better Farming",
            "Fine Home Building",
            "Consumer Report");
    private Stack<String> stack = null;

    public void subscribe(Subscriber<? super String> s) {
        // register Subscriber
        subscriber = s;

        // Issue subscription and register it with subscriber
        subscription = new NewsSubscription();
        s.onSubscribe(subscription);

        // setup and start the data flow
        stack = new Stack();
        articles.forEach(a -> stack.push(a));
        sendData();
    }

    private void sendData() {

        if (stack.empty()) {
            subscriber.onError(new RuntimeException("no news articles") );
            return;
        }

        while(true) {
            long cnt = subscription.getCnt();

            if (stack.empty()) {
                subscriber.onComplete();
                return;
            } else {
                for (; cnt > 0; cnt--) {
                    subscriber.onNext(stack.pop());

                    if (stack.empty()) {
                        subscriber.onComplete();
                        return;
                    }
                }
            }
        }
    }
}
````

NewsSubscriber receives the data but does nothing with it.  It toggles the data
flow between 1 and 2 items.  Each interface method reports when it is called, so
we can see the call order between the publisher and subscriber.

Subscriber rule 1 in the specification states,
```` 
A Subscriber MUST signal demand via Subscription.request(long n) to receive 
onNext signals.  
````
It is the responsibility
if the subscriber to tell the publisher how much data it can initially handle.
It is recommended the subscriber request the upper limit of what it is able to process.
Given that method, ```request```, takes an input parameter of type long, the 
largest value that can be specified is Long.MAX_VALUE.  I am using a value of 
1 here but in the real world a value of 1 would make for very inefficient processing.

The specification does not require ```Subscription.request``` to be called from 
method ```onSubscribe```
but it seems the logical place to declare the initial flow rate, because the
Publisher can start sending data upon return from ```Subscriber.onSubscribe```.

This example toggles the data flow rate in method ```onNext```.  The value is toggled
once the previous number of requested data are received.


````
public class NewsSubscriber implements Subscriber<String> {
    private Subscription subscription;
    private ArrayList<String> articleList = new ArrayList<>();
    private long r = 1;

    @Override
    public void onSubscribe(Subscription s) {
        System.out.println("Subscriber received Subscription object: "
                + s.getClass().getSimpleName());
        subscription = s;
        subscription.request(r);
    }

    @Override
    public void onNext(String t) {
        System.out.println("r=" + r + "  Subscriber received data: " + t);
        articleList.add(t);
        --r;
        if(r == 0) {
            // toggle article flow between 1 and 2 articles
            r = (articleList.size() % 2) + 1;
            subscription.request(r);
        }
    }

    @Override
    public void onError(Throwable t) {
        System.out.println("Subscriber received Error notification. Msg:" +t);
    }

    @Override
    public void onComplete() {
        System.out.println("Subscriber notified Publication Compete");
    }
}
````

In terms of wiring the components there is nothing of significance the user
must be aware of in a Subscription.  It is just a means of conveying a value 
from a subscriber to a publisher.  There are of coarse specification rules 
for its implementation.

````
public class NewsSubscription implements Subscription {
    private long cnt = 0;

    @Override
    public void request(long n) {
        cnt = n;
    }

    @Override
    public void cancel() {
    }

    public long getCnt() {
        return cnt;
    }
}
````

To summarize the steps in wiring a Publisher, Subscriber and Subscription are,

* The Subscriber registers itself with the Publisher.
* The Publisher retains a reference to the Subscriber.
* The Publisher creates a Subscription and registers it with the Subscriber.
* The Subscriber retains a reference to the Subscription.
* The Subscriber sets the initial dataflow value in ```Subscription.request```.


Here is the wiring of the example code in ```Main.pojoStyle()```.

````
        NewsPublisher publisher = new NewsPublisher();
        NewsSubscriber subscriber = new NewsSubscriber();
        publisher.subscribe(subscriber);
````

This is the result of running this example.  The name of the Subscription 
object is listed when ```Subscriber.onSubscribe``` is called.
"r" is the data flow count.
````
        -- pojoStyle --
        Subscriber received Subscription object: NewsSubscription
        r=1  Subscriber received data: Consumer Report
        r=2  Subscriber received data: Fine Home Building
        r=1  Subscriber received data: Better Farming
        r=2  Subscriber received data: Soccer Weekly
        r=1  Subscriber received data: The Gardian
        r=2  Subscriber received data: NASA Notables
        Subscriber notified Publication Compete
````

Here is the more common lambda form.  It can be found in ```Main.lambdaStyle()```.
Note I have removed the code that toggles the flow rate and set request size
to Long.MAX_VALUE.

````
        NewsPublisher publisher = new NewsPublisher();
        publisher.subscribe(new Subscriber <>(){
            ArrayList<String> articleList = new ArrayList<>();
            private Subscription subscription;
            @Override
            public void onSubscribe(Subscription s) {
                System.out.println("Subscriber received Subscription object: "
                        + s.getClass().getSimpleName());
                subscription = s;
                subscription.request(Long.MAX_VALUE);
            }

            @Override
            public void onNext(String t) {
                System.out.println("Subscriber received data: " + t);
                articleList.add(t);
            }

            @Override
            public void onError(Throwable t) {
                System.out.println("Subscriber received Error notification. Msg:" +t);
            }

            @Override
            public void onComplete() {
                System.out.println("Subscriber notified Publication Compete");
            }
        });
    }
````

The results of running this code is as follows.
````
        -- lambdaStyle --
        Subscriber received Subscription object: NewsSubscription
        Subscriber received data: Consumer Report
        Subscriber received data: Fine Home Building
        Subscriber received data: Better Farming
        Subscriber received data: Soccer Weekly
        Subscriber received data: The Gardian
        Subscriber received data: NASA Notables
        Subscriber notified Publication Compete
````

Lets see how this example is implemented using the RxJava library.

RxJava is a Java VM implementation of Reactive Extensions (ReactiveX), a library
for composing asynchronous and event-based programs.  It is built upon the Reactive
Streams' API and concepts.  The RxJava library provides a base set of reactive classes,
Observable, Flowable, Completable, Maybe, and Single, that are Publishers.  Each
of these classes provide factory methods, intermediate operators and the ability
to consume reactive dataflows.

Flowable is the only implementation in the set that adheres fully to the Reactive
Streams 1.0 Specification.  The other classes don’t directly implement the Publisher
interface or other Reactive Streams interfaces, but they do define like interfaces that
are in keeping with those in the specification.

RxJava introduces an interface I think is of particular interest in this
discussion, Emitter.
The Emitter is the interface though which an external data source is connected
to a Publisher.  The definition of Emitter is nearly identical to the Subscriber interface.
It is lacking the ```onSubscribe``` method.  Having identical method names and nearly
identical method signatures was quite confusing initially.  There are many
implementations of this interface in RxJava.  Each implements a different dataflow
control strategy.

````
    public interface Emitter<T> {
      void onNext(@NonNull T value);
      void onError(@NonNull Throwable error);
      void onComplete();
      }
````

Because Flowable adheres to the Reactive Streams Specification.  I will use it for
the examples.  Two classes are available to create a Flowable object, FlowableCreate
and Flowable.  We will first look at FlowableCreate.  It is a subclass of Flowable
and performs the actual wiring of a subscriber to a publisher and a publisher to
an external data source.

The constructor for FlowableCreate requires input parameters, FlowableOnSubscribe 
and BackpressureStrategy.  FlowableOnSubscribe is a RxJava Publisher type.  It 
has a similar interface definition to Reactive Streams' Publisher.  It has a single 
method  ```subscribe``` but
the input parameter to ```subscribe```, is a type of Emitter not a Subscriber.  This
interface provides the means for external data to be passed to the provided Emitter
for handling.

````
    public interface FlowableOnSubscribe<T> {
        void subscribe(@NonNull FlowableEmitter<T> emitter) throws Exception;
    }
````

I will create a Flowable object whose emitter transmits the same data we used in
NewsPublisher.  Below is my code for that.  The lambda for ```FlowableOnSubscribe.subscribe```
(lines 90-94) will pass the list of news articles to an emitter provided by FlowableCreate.
(We will look at this in more detail shortly.)  Input parameter, BackpressureStrategies
(line 96) is a enum.  There are 5 strategy types.  I am choosing BackpressureStrategy.BUFFER
for no particular reason.

To subscribe to FlowableCreate one must call method ```subscribeActual``` not method 
```subscribe```.
Method ```subscribeActual``` is defined as an abstract method in Flowable and implemented
in FlowableCreate, which you will remember is a subclass of Flowable.  When
```Flowable.subscribe``` is called it in turn calls ```FlowableCreate.subscribeActual```
thus allowing both classes to share the same code for component wiring.  At line 98
```subscribeActual``` is called and my subscriber, NewsSubscriber is passed to it.

````
   88     FlowableCreate<String> flowableC = new FlowableCreate(new FlowableOnSubscribe<String>() {
   89         @Override
   90         public void subscribe(FlowableEmitter<String> emitter) throws Exception {
   91             for (int i = articles.size()-1; i >= 0; i--) {
   92                 emitter.onNext(articles.get(i));
   93             }
   94             emitter.onComplete();
   95         }
   96     }, BackpressureStrategy.BUFFER);
   97
   98     flowableC.subscribeActual(new NewsSubscriber());
````


Lets examine the code in FlowableCreate's constructor and the ```subscribeActual``` method.

````
    32  public final class FlowableCreate<T> extends Flowable<T> {
    33
    34    final FlowableOnSubscribe<T> source;
    35    final BackpressureStrategy backpressure;
    36
    37    public FlowableCreate(FlowableOnSubscribe<T> source, BackpressureStrategy backpressure) {
    38        this.source = source;
    39        this.backpressure = backpressure;
    40    }
    41
    42    @Override
    43    public void subscribeActual(Subscriber<? super T> t) {
    44        BaseEmitter<T> emitter;
    45
    46        switch (backpressure) {
    47            case MISSING: {
    48                emitter = new MissingEmitter<T>(t);
    49                break;
    50            }
    51            case ERROR: {
    52                emitter = new ErrorAsyncEmitter<T>(t);
    53                break;
    54            }
    55            case DROP: {
    56                emitter = new DropAsyncEmitter<T>(t);
    57                break;
    58            }
    59            case LATEST: {
    60                emitter = new LatestAsyncEmitter<T>(t);
    61                break;
    62            }
    63            default: {
    64                emitter = new BufferAsyncEmitter<T>(t, bufferSize());
    65                break;
    66            }
    67        }
    68
    69        t.onSubscribe(emitter);
    70        try {
    71            source.subscribe(emitter);
    72        } catch (Throwable ex) {
    73            Exceptions.throwIfFatal(ex);
    74            emitter.onError(ex);
    75        }
    76    }
````

In the constructor, my implementation for class FlowableOnSubscribe is saved in
variable **source**.  The value of BackpressureStrategy is saved in variable 
**backpressure**.

In method ```subscribeActual``` you will see classes representing the 5 backpressure
strategies supported by Flowable (lines 46-64).  Their implementations reside in this 
class if you care to take a look.
A backpressure strategy is always allocated. BUFFERED is the default strategy.
Class BufferAsyncEmitter implements that strategy.  Each of these strategies
implement the Reactive Streams' Subscription interface.

In my call to ```subscribeActual```, NewsSubscriber is referenced  via variable **t**.
My NewsSubscriber object is registered with subscription, BufferAsyncEmitter (line 64).
BufferAsyncEmitter is registered with NewsSubscriber
(line 69) when ```t.onSubscribe(emitter)``` is called.  The final wiring step is to 
connect the emitter (BufferAsyncEmitter) with the external source of data generation,
**source**, (FlowableOnSubscribe) (line 71) in the call to ```source.subscribe(emitter)```.

If you recall I mentioned earlier in the discussion that when ```Subscriber.onSubscribe```
is called, part of its initialization process is to call ```Subscription.request```
to set the data flow rate.
NewsSubscriber, **t** does that, however BufferAsyncEmitter is not yet connection to
a data source, so there is no data to be transmitted upon return from ```onSubscribe```.
It is not until line 71
when **emitter**, (BufferAsyncEmitter) is passed to **source**, (FlowableOnSubscribe) 
```subscribe``` that external data is provided to the **emitter** and it starts sending 
the data to NewsSubscriber.


Here is the output from the example code in ```Main.flowableCreateStyle()```.
I am using NewsSubscriber which throttles the flow rate between 1 and 2.
As I would expect the output is the same as for ```pojoStyle``` except the subscription
object is BufferAsyncEmitter and not NewsSubscription.

````
        -- flowableCreateStyle --
        Subscriber received Subscription object: BufferAsyncEmitter
        r=1  Subscriber received data: Consumer Report
        r=2  Subscriber received data: Fine Home Building
        r=1  Subscriber received data: Better Farming
        r=2  Subscriber received data: Soccer Weekly
        r=1  Subscriber received data: The Gardian
        r=2  Subscriber received data: NASA Notables
        Subscriber notified Publication Compete
````

Now lets look at an example that creates a Flowable using ```Flowable.create```.
Method ```Flowable.create``` is a static method requiring the same input parameters
as the FlowableCreate constructor.  As you can see below, ```create``` is a wrapper method
whose only purpose is to create and return a FlowableCreate object (line 1813).

RxJavaPlugins is a utility class that enables new handlers to be injected into
some operations, such as ```onAssembly``` and ```onSubscribe```, however I am not using 
this feature, so an unaltered FlowableCreate object is being returned by this method.

````
   1810     public static <T> Flowable<T> create(FlowableOnSubscribe<T> source, BackpressureStrategy mode) {
   1811         ObjectHelper.requireNonNull(source, "source is null");
   1812         ObjectHelper.requireNonNull(mode, "mode is null");
   1813         return RxJavaPlugins.onAssembly(new FlowableCreate<T>(source, mode));
   1814     }
````

Here is the code that creates a Flowable object whose emitter transmits the
same data we used in NewsPublisher.  The implementation of FlowableOnSubscribe
is identical to that used in FlowableCreate.

````
   113     Flowable<String> flowable = Flowable.create(new FlowableOnSubscribe<String>() {
   114         @Override
   115         public void subscribe(FlowableEmitter<String> emitter) throws Exception {
   116             for (int i = articles.size()-1; i >= 0; i--) {
   117                 emitter.onNext(articles.get(i));
   118             }
   119             emitter.onComplete();
   120         }
   121     }, BackpressureStrategy.BUFFER);
````

Next I call ```flowable.subscribe```.  Flowable has many overloaded methods for 
```subscribe```.  I will leave it to you to give them a look.
I am using the one associated with the Reactive Streams' Publisher interface 
so I must cast flowable
to type Publisher for the desired method to be called.  I am using lambda code
here just for variety.  I could have used class NewsSubscriber just as easily.

````
   123     ((Publisher<String>)flowable).subscribe(new Subscriber <>(){
   124         ArrayList<String> articleList = new ArrayList<>();
   125         private Subscription subscription;
   126         @Override
   127         public void onSubscribe(Subscription s) {
   128             System.out.println("Subscriber received Subscription object: "
   129                     + s.getClass().getSimpleName());
   130             subscription = s;
   131             subscription.request(Long.MAX_VALUE);
   132         }
   133
   134         @Override
   135         public void onNext(String t) {
   136             System.out.println("Subscriber received data: " + t);
   137             articleList.add(t);
   138         }
   139
   140         @Override
   141         public void onError(Throwable t) {
   142             System.out.println("Subscriber received Error notification. Msg:" +t);
   143         }
   144
   145         @Override
   146         public void onComplete() {
   147             System.out.println("Subscriber notified Publication Compete");
   148         }
   149     });
````

As I noted previously method ```Flowable.subscribe``` calls  ```FlowableCreate.subscribeActual```.
Here is the result I get when I run the example code in ```Main.flowableStyle()```.

````
        -- flowableStyle --
        Subscriber received Subscription object: StrictSubscriber
        Subscriber received data: Consumer Report
        Subscriber received data: Fine Home Building
        Subscriber received data: Better Farming
        Subscriber received data: Soccer Weekly
        Subscriber received data: The Gardian
        Subscriber received data: NASA Notables
        Subscriber notified Publication Compete
````

Hmmm why is the subscription object StrictSubscriber and not BufferAsyncEmitter?
Where does StrictSubscriber come from and what does it do?

Below is the code for the ```Flowable.subscribe``` method my code calls.
At line 14756 my subscriber, **s**, is wrapped in class StrictSubscriber which 
is a type of Subscription.  

````
   14749     @Override
   14750     public final void subscribe(Subscriber<? super T> s) {
   14751         if (s instanceof FlowableSubscriber) {
   14752             subscribe((FlowableSubscriber<? super T>)s);
   14753         } else {
   14754             ObjectHelper.requireNonNull(s, "s is null");
   14755             subscribe(new StrictSubscriber<T>(s));
   14756         }
   14757     }
````

The JavaDoc for StrictSubscriber states, 
````
Ensures that the event flow between the upstream and downstream follow
the Reactive-Streams 1.0 specification ...
````

My subscriber object is the **downstream** object in this example.
I am assuming BufferAsyncEmitter will become the **upstream** object.

Lets continue following Flowable's method calls into ```subscribeActual```.
Executing line 14755 above drops us into method, ```subscribe```, below.
The value of the input parameter, **s**, is the StrictSubscriber object.
At line 14801 the call to ```RxJavaPlugins.onSubscribe(this, s)``` does nothing
but cast StrictSubscriber to Subscriber.  The call to ```subscribeActual``` is made at
line 14805.  **z**, the unchanged value of StrictSubscriber, is passed in to 
```subscribeActual```.

````
  14798     public final void subscribe(FlowableSubscriber<? super T> s) {
  14799         ObjectHelper.requireNonNull(s, "s is null");
  14800         try {
  14801              Subscriber<? super T> z = RxJavaPlugins.onSubscribe(this, s);
  14802
  14803              ObjectHelper.requireNonNull(z, "The RxJavaPlugins.onSubscribe hook returned a null FlowableSubscriber. Please check the handler provided to RxJavaPlugins.setOnFlowableSubscribe for invalid null returns. Further reading: https://github.com/ReactiveX/RxJava/wiki/Plugins");
  14804
  14805              subscribeActual(z);
  14806          } catch (NullPointerException e) { // NOPMD
  14807              throw e;
  14808          } catch (Throwable e) {
                     .............
````

We are now in ```FlowableCreate.subscribeActual```.  Lets review the value of the variables
in this class.  Variable **source** is the FlowableOnSubscribe implementation I provided
in the call to ```Flowable.create``` in ```Main.flowableStyle```.  It is the object 
that is going to pass the
external data to BufferAsyncEmitter.  Variable **backpressure** was set to BUFFER in
that same call.  StrictSubscriber is the value of the input parameter, **t** in method
```subscribeActual```.  It is a wrapper class around the lambda definition of Subscriber
I provided in ```Main.flowableStyle```.  Its **downstream** variable is set.  Its **upstream**
variable is not.

At line 64 **t**, StrictSubscriber, is registered with BufferAsyncEmitter 
and at line 69 BufferAsyncEmitter is registered with StrictSubscriber.

````
    42    @Override
    43    public void subscribeActual(Subscriber<? super T> t) {
    44        BaseEmitter<T> emitter;
                ......
    63            default: {
    64                emitter = new BufferAsyncEmitter<T>(t, bufferSize());
    65                break;
    66            }
    67        }
    68
    69        t.onSubscribe(emitter);
    70        try {
    71            source.subscribe(emitter);
    72        }
````

Lets look at the code for ```StrictSubscriber.onSubscribe``` to see how BufferAsyncEmitter
is set.

````
   81     @Override
   82     public void onSubscribe(Subscription s) {
   83         if (once.compareAndSet(false, true)) {
   84
   85             downstream.onSubscribe(this);
   86
   87             SubscriptionHelper.deferredSetOnce(this.upstream, requested, s);
   88        } else {
   89             s.cancel();
   90             cancel();
   91             onError(new IllegalStateException("§2.12 violated: onSubscribe must be called at most once"));
   92         }
   93     }
````

Variable **downstream** is the Subscriber object I define in ```Main.flowableStyle```.
The execution of line 85 registers **this**, StrictSubscriber, with my original
subscriber, that is why the first line of the results output says the subscription
type is StrictSubscriber and not BufferAsyncEmitter.  This is new a layer of indirection
that adds complexity to the wiring.  I found it initially confusing.

The SubscriptionHelper (line 87) is setting the local variable, **upstream** to
the value of input parameter **s**, (BufferAsyncEmitter) and passes the initial
dataflow rate set in my subscriber via variable **requested** into **upstream**.

Back in ```FlowableCreate.subscribeActual```, the final step is to connect the emitter, 
(BufferAsyncEmitter) with the external data source, (FlowableOnSubscribe) with 
the call to ```source.subscribe(emitter)``` at line 71.

That completes my discussion of wiring of a Subscriber, Publisher and Subscription.
I hope it provided some clarity to this programming paradigm.  But wait! 
How does the dataflow from FlowableOnSubscribe, to BufferAsyncEmitter, to StrictSubscriber, 
and then to Subscriber, you ask. I leave that as a topic for you to explore.
I suggest using the github project for this article to walk through that code using a debugger.


#### References
* [Reactive Streams Specification](https://github.com/reactive-streams/reactive-streams-jvm)
* [Mastering own Reactive-Streams implementation. Part 1 - Publisher.](https://medium.com/@olehdokuka/mastering-own-reactive-streams-implementation-part-1-publisher-e8eaf928a78c)
* [RxJava Plugins](http://reactivex.io/documentation/plugins.html)
* [RxJava 2.0](https://github.com/ReactiveX/RxJava/wiki/What%27s-different-in-2.0)
* [Flowable](https://www.programmersought.com/article/3415851924/)









