import { upstreamRoutes } from "../../utils/api-routes";
import { upstreamFetch } from "../../utils/upstream-fetch";

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event);

  return upstreamFetch(event, upstreamRoutes.importLaunchXml, {
    method: "POST",
    body: formData,
  });
});
