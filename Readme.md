# Express with HTTP2 and Server Push :rocket:

> Express with HTTP2 Example.
> Server Push Example.

## Try HTTP2

> Please make sure sure you add nghttp2 in advance libcurl If you'd like to try it on curl

```sh
brew install curl --with-nghttp2
```

---

```sh
docker build -t express-server .
docker run -tid -p 3000:3000 express-server

# check http2 response

curl -kiv https://localhost:3000/

##############
* Connection state changed (MAX_CONCURRENT_STREAMS updated)!
< HTTP/2 200
HTTP/2 200
##############

```

## Try Server Push

Chrome browser: https//localhost:3000/push/ to access.

Check HTTP2_SESSION from chrome://net-internals/#events
You can find should surely below

```
t=3850 [st=10]  HTTP2_SESSION_RECV_PUSH_PROMISE
                --> :method: GET
                    :path: /app/public//js/main.js
                    :scheme: https
                    :authority: localhost:3000
                    accept: */*
                --> id = 7
                --> promised_stream_id = 6
t=3850 [st=10]  HTTP2_SESSION_RECV_PUSH_PROMISE
                --> :method: GET
                    :path: /app/public/js/app.js
                    :scheme: https
                    :authority: localhost:3000
                    accept: */*
                --> id = 7
                --> promised_stream_id = 8
```
