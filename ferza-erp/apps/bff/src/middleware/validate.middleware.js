import { ZodError } from "zod";

export function validate({ body, query, params } = {}) {
  return (req, res, next) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (query) req.query = query.parse(req.query);
      if (params) req.params = params.parse(req.params);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: "ValidationError",
          issues: err.issues,
        });
      }
      return next(err);
    }
  };
}

