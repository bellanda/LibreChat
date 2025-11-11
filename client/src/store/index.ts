import * as artifacts from './artifacts';
import endpoints from './endpoints';
import families from './families';
import lang from './language';
import misc from './misc';
import preset from './preset';
import prompts from './prompts';
import search from './search';
import settings from './settings';
import submission from './submission';
import isTemporary from './temporary';
import text from './text';
import toast from './toast';
import user from './user';
export * from './agents';
export * from './mcp';

const store = {
  ...artifacts,
  ...families,
  ...endpoints,
  ...user,
  ...text,
  ...toast,
  ...submission,
  ...search,
  ...prompts,
  ...preset,
  ...lang,
  ...settings,
  ...misc,
  ...isTemporary,
};

// Debug: log any undefined atoms
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  Object.keys(store).forEach((key) => {
    if (store[key] === undefined) {
      console.error(`[Recoil Store] Atom "${key}" is undefined!`);
    }
  });
}

export default store;
