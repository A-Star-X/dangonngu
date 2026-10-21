'use client';
// @spec APP-10, C7-02
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { RouteName } from '@/lib/routes';
import { dismiss, notify, TOAST_ACTION_MS } from '@/lib/toast';
import { appReload, onUpdate, updateAvailable } from '@/lib/updates';

const HIDDEN_ON: RouteName[] = ['phien-hoc', 'kiem-tra'];
const ID = 'cap-nhat';

/** Hiện thông báo "Có bản cập nhật", trừ khi đang ở S3 hoặc S5; khi đó đợi tới lúc rời màn. */
export function useUpdateNotice(route: RouteName | null) {
  const t = useTranslations('update');
  const pending = useRef(false);
  /** Thông báo đang hiện tới lúc nào (C7-02: 6 giây khi có nút hành động). */
  const visibleUntil = useRef(0);
  const routeRef = useRef(route);
  const show = useRef<() => void>(() => undefined);
  useEffect(() => {
    routeRef.current = route;
    show.current = () => {
      if (HIDDEN_ON.includes(routeRef.current as RouteName)) {
        pending.current = true;
        return;
      }
      pending.current = false;
      visibleUntil.current = Date.now() + TOAST_ACTION_MS;
      notify(t('available'), { id: ID, action: { label: t('apply'), onClick: () => appReload.run() } });
    };
  });

  useEffect(() => {
    const off = onUpdate(() => show.current());
    if (updateAvailable()) show.current();
    return off;
  }, []);

  useEffect(() => {
    if (HIDDEN_ON.includes(route as RouteName)) {
      // Vào S3 hoặc S5 khi thông báo còn hiện: ẩn đi và hiện lại khi rời màn.
      if (Date.now() < visibleUntil.current) {
        dismiss(ID);
        visibleUntil.current = 0;
        pending.current = true;
      }
      return;
    }
    if (pending.current) show.current();
  }, [route]);
}
