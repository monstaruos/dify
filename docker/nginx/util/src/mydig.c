#include <stdio.h>
#include <netdb.h>


int main(int argc, const char** argv) {
  struct addrinfo* res;
  uint32_t ip4val;
  uint8_t* pui8;
  int err;

  --argc;
  if ( argc < 1 ) {
    fprintf(stderr, "usage: mydig hostname\n");
    return EAI_NONAME;
  }

  err = getaddrinfo(argv[1], NULL, NULL, &res);
  if ( 0 != err ) {
    return err;
  }

  ip4val = ((struct sockaddr_in*)res->ai_addr)->sin_addr.s_addr;
  pui8   = (uint8_t*)&ip4val;
  printf("%u.%u.%u.%u", pui8[0], pui8[1], pui8[2], pui8[3]);

  return 0;
}
