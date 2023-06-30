
export interface Env {
	REPLICATED_TOKEN: string,
  REPLICATED_APPID: string,
  REPLICATED_CHANNELID: string,
  CORS_ORIGIN: string,
}

export interface RequestBody {
  email: string,
  name: string,
}

export interface ResponseBody {
  license: string,
  registryUsername: string,
  registryPassword: string,
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
    const token = env.REPLICATED_TOKEN;
    const appId = env.REPLICATED_APPID;
    const channelId = env.REPLICATED_CHANNELID;
    const replicatedApiEndpoint = `https://api.replicated.com/vendor`;

    const requestBody: RequestBody = await request.json();
    console.log(request);
    console.log(env);
    // create the customer
    const body = {
      "app_id": appId,
      "channel_id": channelId,
      "email": requestBody.email,
      "name": requestBody.name,
      "type": "community"
    };

    let resp = await fetch(`${replicatedApiEndpoint}/v3/customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify(body),
    });

    if (resp.status !== 201) {
      const replicatedError = await resp.text();
      console.error(replicatedError);

      return new Response("failed to create customer", {
        status: 500,
      });
    }

    interface CreateCustomerResponse {
      customer: {
        id: string,
        email: string,
        installationId: string,
      }
    };

    const createCustomerResponse: CreateCustomerResponse = await resp.json();

    // download the license for this customer
    resp = await fetch(`${replicatedApiEndpoint}/v3/app/${appId}/customer/${createCustomerResponse.customer.id}/license-download`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
    });

    if (resp.status !== 200) {
      return new Response("failed to download license", {
        status: 500,
      });
    }

    const licenseYAML = await resp.text();

    const responseBody: ResponseBody = {
      license: licenseYAML,
      registryUsername: createCustomerResponse.customer.email,
      registryPassword: createCustomerResponse.customer.installationId,
    };
    const rtnResponse = new Response(JSON.stringify(responseBody));
    rtnResponse.headers.set("Access-Control-Allow-Origin", env.CORS_ORIGIN);
    rtnResponse.headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,PUT,OPTIONS");
    rtnResponse.headers.set("Access-Control-Max-Age", "86400");
      
		return rtnResponse;
	},
};
