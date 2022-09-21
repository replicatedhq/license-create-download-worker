# Replicated License Create/Download Cloudflare Worker

This is a Cloudflare worker to create and download a license.

## Usage

Create three secrets in Cloudflare:

```
wrangler secret put REPLICATED_TOKEN
wrangler secret put REPLICATED_APPID
wrangler secret put REPLICATED_CHANNELID
```

Create a Replicated RBAC Policy with at least this scope:
(replace my-app-id with your appid):

```
{
  "v1": {
    "name": "Create and Download License",
      "resources": {
        "allowed": [
          "kots/app/[my-app-id]/license/create",
          "kots/app/[my-app-id]/license/*/read"
        ],
        "denied": [
          "**/*"
         ]
      }
  }
}
```

Execute this by making a POST request with email and name:

```
curl -X POST \
  --header "Content-Type: application/json" \
  --data '{"email": "customeremail@domain.com", "name": "customer name"}' \
  http://localhost:8787  ## this is for dev
```
