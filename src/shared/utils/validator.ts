import { ObjectSchema } from 'joi';
import { Request, Response, NextFunction } from 'express';
import { RESPONSE_CODES } from '../utils/constants';

export const validateSchema = (schema: ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {

    const data = (source === 'query' ? req.query : (source === 'params' ? req.params : req.body));

    const { error } = schema.validate(data);

    if (error) {
      return res.status(RESPONSE_CODES.BAD_REQUEST).json({
        status: 0,
        status_code: RESPONSE_CODES.BAD_REQUEST,
        message: error.message,
      });
    }

    next();
  };
};