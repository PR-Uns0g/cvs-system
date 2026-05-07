import { upstreamRoutes } from "../../utils/api-routes";
import { sumImpostosRecord, unwrapUpstreamList } from "../../utils/upstream-list";
import { upstreamFetch } from "../../utils/upstream-fetch";

export default defineEventHandler(async (event) => {
  const raw = await upstreamFetch<unknown>(event, upstreamRoutes.launches);
  const list = unwrapUpstreamList(raw);

  let receitaContratante = 0;
  let valorNfTotal = 0;
  let montanteImpostos = 0;

  for (const row of list) {
    receitaContratante += Number(row.faturamento_contratante ?? 0);
    valorNfTotal += Number(row.valor_nf ?? 0);
    montanteImpostos += sumImpostosRecord(row.impostos);
  }

  const ratio =
    receitaContratante > 0 ? (valorNfTotal / receitaContratante) * 100 : 0;

  return {
    receita_contratante: receitaContratante,
    meu_faturamento: valorNfTotal,
    total_impostos: montanteImpostos,
    quantidade_lancamentos: String(list.length),
    percentual_comissao: Number.isFinite(ratio) ? ratio : 0,
    updated_at: new Date().toISOString(),
  };
});
