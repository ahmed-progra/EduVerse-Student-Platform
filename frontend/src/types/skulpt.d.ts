declare module "skulpt" {
  // Skulpt ships no type definitions; its runtime (`Sk.*`) is a large dynamic surface, so `any`
  // is the pragmatic boundary type here. Consumers narrow values as they read them.
  const Sk: any;
  export default Sk;
}
