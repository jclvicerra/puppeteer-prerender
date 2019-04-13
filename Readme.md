# Prerender Puppeteer Service

This is a web page prerenderer service using Puppeteer(Chrome headless node API).

Useful server side rendering through proxy. Outputs HTML, PDF and screenshots as PNG.

```bash
.
├── README.MD                   <-- This instructions file
├── Dockerfile                  <-- Instruction for adding puppeteer in docker
├── src                         <-- Source code for a prerender service
│   └── lambda                  <-- Cloudfront functions
│     └── addRenderHeaders.js   <-- Viewer Request function to add header if request if from crawlers
│     └── RouteToRendered.js    <-- Origin Request function to add custom origin to prerender service if the headers is present
│     └── template.js           <-- SAM template for lambda
│   └── core                    <-- Contains core classes for rendering
│     └── Renderer.js           <-- Puppeteer renderer code
    └── routes                  <-- Contains express routes
│     └── health.js             <-- Health check route - prerender-service.io/_health
│     └── renderer.js           <-- Renderer route
│   └── cache.js                <-- Renderer in-memory cache
│   └── index.js                <-- Express app entry point 
│   └── package.json            <-- NodeJS dependencies and scripts
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Build Docker Image

```bash
docker build -t puppeteer-chrome-linux .
```

### Start Docker Image

```bash
docker run -i --rm --cap-add=SYS_ADMIN --name puppeteer-chrome -p 8080:3000 puppeteer-chrome-linux
```

### Deploying to Elasticbeanstalk

```bash
eb deploy
```

## API

| Name    | Required | Value               | Description            |Usage                                                         |
|---------|:--------:|:-------------------:|------------------------|--------------------------------------------------------------|
|`url`    | yes      |                     |Target URL              |`http://puppeteer-renderer?url=http://www.google.com`         |
|`type`   |          |`pdf` or `screenshot`|Rendering another type. |`http://puppeteer-renderer?url=http://www.google.com&type=pdf`|
|(Extra options)|    |                     |Extra options (see [puppeteer API doc](https://github.com/GoogleChrome/puppeteer/blob/v1.1.0/docs/api.md#pagepdfoptions)) |`http://puppeteer-renderer?url=http://www.google.com&type=pdf&scale=2`|


## PDF File Name Convention

Generated PDFs are returned with a `Content-disposition` header requesting the browser to download the file instead of showing it.
The file name is generated from the URL rendered:

| URL                                           | Filename                     |   
|-----------------------------------------------|------------------------------|   
| `https://www.example.com/`                    | `www.example.com.pdf`        |
| `https://www.example.com:80/`                 | `www.example.com.pdf`        |
| `https://www.example.com/resource`            | `resource.pdf`               |
| `https://www.example.com/resource.extension`  | `resource.pdf`               |
| `https://www.example.com/path/`               | `path.pdf`                   |
| `https://www.example.com/path/to/`            | `pathto.pdf`                 |
| `https://www.example.com/path/to/resource`    | `resource.pdf`               |
| `https://www.example.com/path/to/resource.ext`| `resource.pdf`               |

## Links:

[How to Get Server Side Rendering Benefits (Unfurling, Indexing, Search-ability) without Building SSR Logic](https://medium.com/bounties-network/how-to-get-server-side-rendering-benefits-unfurling-indexing-search-ability-without-building-cf09c53a408)

[Headless Chrome: an answer to server-side rendering JS sites](https://developers.google.com/web/tools/puppeteer/articles/ssr)

[Installing Puppeteer in Docker](https://developers.google.com/web/tools/puppeteer/troubleshooting)

[Puppeteer Repo & Docs](https://github.com/GoogleChrome/puppeteer)

[Puppeteer on Lambda](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md&#35;running-puppeteer-on-aws-lambda)

[Base Docker Image for Renderer 1](https://github.com/alekzonder/docker-puppeteer)
[Base Docker Image for Renderer 2](https://hub.docker.com/r/zenato/puppeteer-renderer)
[Base Code](https://github.com/zenato/puppeteer-renderer)

[Try Puppeteer ](https://github.com/ebidel/try-puppeteer)
[Cloudfront Generate Full Path](https://github.com/riboseinc/terraform-aws-s3-cloudfront-website/issues/1)


## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present, Jessie Cris Vicerra
