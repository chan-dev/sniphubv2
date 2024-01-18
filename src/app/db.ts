import { createClient } from '@supabase/supabase-js';

import { environment } from '../environments/environment';

export const db = createClient(
  environment.supabase.projectUrl,
  environment.supabase.apiKey,
);
