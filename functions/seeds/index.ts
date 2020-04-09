import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import getSeeds from "../src/getSeeds"

const httpTrigger: AzureFunction = async function(context: Context, req: HttpRequest): Promise<void> {
    // TODO: make sure that's right
    const version = context.req.query.version

    const responseJSON = getSeeds(version)
    context.res = {
        status: 200,
        body: responseJSON
    }
}

export default httpTrigger
