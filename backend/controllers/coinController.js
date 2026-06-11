import { getCoinBalance, listCoinTransactions } from "../services/coinService.js";
import { sendSuccess } from "../utils/responseHandler.js";

export async function getBalance(req, res) {
  const data = await getCoinBalance(req.user._id);
  return sendSuccess(res, { message: "Coin balance retrieved", data });
}

export async function getTransactions(req, res) {
  const { items, meta } = await listCoinTransactions(req.user._id, req.query);
  return sendSuccess(res, { message: "Coin transactions retrieved", data: items, meta });
}
