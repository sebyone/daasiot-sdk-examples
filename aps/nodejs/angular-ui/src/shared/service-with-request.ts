export abstract class ServiceWithRequest {
  [x: string]: any;
  getUser() {
    if(this.request) {
      return this.request.user;
    }
  }
}
