import { upstreamRoutes } from "../../utils/api-routes";
import { upstreamFetch } from "../../utils/upstream-fetch";

export default defineEventHandler(async (event) => {
  const incoming = await readFormData(event);
  const upstreamBody = new FormData();

  for (const [key, value] of incoming) {
    upstreamBody.append(key, value);
  }

  return upstreamFetch(event, upstreamRoutes.importLaunchXml, {
    method: "POST",
    body: upstreamBody,
  });
});
