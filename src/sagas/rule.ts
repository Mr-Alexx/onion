import { takeEvery, put, select } from "redux-saga/effects";
import { toggle, allow, disallow } from "@/actions/rule";
import { queryFilter } from "@/utils";
import { BlockingFilter } from "@/lib/adblockplus";
import { Action } from "redux-actions";

import { Rule, TogglePayload } from "@/actions/rule";
import { State } from "@/store";

export function* toggleSaga(action: Action<TogglePayload>) {
  const url = action.payload.url;
  const rule: Rule[] = yield select((state: State) => state.rule);
  const { hostname } = new URL(url);
  const patterns = rule.map(r => r.pattern);
  const filter = queryFilter([url], patterns)[0];
  const ind = filter ? rule.findIndex(r => r.pattern === filter.text) : -1;
  if (filter instanceof BlockingFilter) {
    yield put(disallow(hostname, ind));
  } else {
    yield put(allow(hostname, filter ? ind : undefined));
  }
  chrome.tabs.reload();
}

export default function* watchToggle() {
  yield takeEvery(toggle.toString(), toggleSaga);
}
