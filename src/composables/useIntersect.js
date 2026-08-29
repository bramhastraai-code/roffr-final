// One shared IntersectionObserver for the whole app.
//
// Every reveal and every motion-gate registers here instead of constructing
// its own observer — the homepage alone would otherwise create ~50. Observers
// are keyed by rootMargin, since that is the only option that varies.

const registries = new Map(); // rootMargin -> { observer, callbacks: WeakMap }

const registryFor = (rootMargin) => {
  let registry = registries.get(rootMargin);
  if (registry) return registry;

  const callbacks = new WeakMap();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        callbacks.get(entry.target)?.(entry);
      }
    },
    { rootMargin, threshold: 0 },
  );

  registry = { observer, callbacks };
  registries.set(rootMargin, registry);
  return registry;
};

export const observe = (el, callback, rootMargin = '0px 0px -10% 0px') => {
  if (!el || typeof IntersectionObserver === 'undefined') {
    // No observer support: fire immediately so content is never left hidden.
    callback?.({ isIntersecting: true, target: el });
    return;
  }
  const { observer, callbacks } = registryFor(rootMargin);
  callbacks.set(el, callback);
  observer.observe(el);
};

export const unobserve = (el, rootMargin = '0px 0px -10% 0px') => {
  if (!el) return;
  const registry = registries.get(rootMargin);
  if (!registry) return;
  registry.callbacks.delete(el);
  registry.observer.unobserve(el);
};
