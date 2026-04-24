export function sendResult(res, result) {
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}
