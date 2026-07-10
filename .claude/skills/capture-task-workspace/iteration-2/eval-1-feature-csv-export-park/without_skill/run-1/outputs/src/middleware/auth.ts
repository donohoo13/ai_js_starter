import { getSession } from '../lib/session';

export async function requireOrg(req: Request): Promise<Response | undefined> {
  const session = await getSession(req);
  const orgId = session.user.orgId;
  if (!orgId) {
    return Response.redirect('/login');
  }
}
