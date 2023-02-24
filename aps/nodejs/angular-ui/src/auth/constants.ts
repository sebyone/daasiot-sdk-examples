
// todo: in a production system you must protect this key using appropriate
//  measures such as a secrets vault, environment variable, or configuration
//  service.
export const jwtConstants = {
  secret: 'a_real_cool_secret',
  expiresIn: '6s',
  refreshSecret: 'the_refresh_secret',
  refreshExpiresIn: '432000s'
};
