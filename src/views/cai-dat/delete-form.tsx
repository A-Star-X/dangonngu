'use client';
// @spec S8-05
// Sheet xác nhận xóa tiến độ: gõ đúng tên ngôn ngữ mới mở nút Xóa (react-hook-form + zod, lỗi hiện ngay dưới ô).
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sameName } from './utils/file-io';

export function DeleteForm({ name, onCancel, onDelete }: { name: string; onCancel: () => void; onDelete: () => void }) {
  const t = useTranslations('s8');
  const schema = useMemo(() => z.object({ typed: z.string().refine((v) => sameName(v, name), { message: t('deleteMismatch') }) }), [name, t]);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting, dirtyFields },
  } = useForm<{ typed: string }>({ resolver: zodResolver(schema), mode: 'onChange', defaultValues: { typed: '' } });
  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(() => onDelete())} noValidate>
      <p className="text-data">{t('deleteBody', { name })}</p>
      <label className="flex flex-col gap-1">
        <span className="text-label">{t('deleteLabel')}</span>
        <Input autoComplete="off" invalid={Boolean(errors.typed && dirtyFields.typed)} aria-describedby={errors.typed ? 's8-delete-error' : undefined} {...register('typed')} />
      </label>
      {errors.typed && dirtyFields.typed && (
        <p id="s8-delete-error" className="text-sm text-danger" role="alert">
          {errors.typed.message}
        </p>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <Button tone="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button tone="danger" type="submit" locked={!isValid} busy={isSubmitting}>
          {t('delete')}
        </Button>
      </div>
    </form>
  );
}
