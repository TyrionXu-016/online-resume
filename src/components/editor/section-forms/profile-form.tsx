"use client";

import type { ProfileData } from "@/modules/resume/schemas/sections/profile";
import { useEditorStore } from "@/stores/editor-store";
import { FieldLabel, FormCard, FormGrid, TextField } from "../form-fields";

export function ProfileForm({ sectionId, data }: { sectionId: string; data: ProfileData }) {
  const patchSectionData = useEditorStore((state) => state.patchSectionData);

  function update(patch: Partial<ProfileData>) {
    patchSectionData(sectionId, { ...data, ...patch });
  }

  return (
    <FormCard title="基本信息">
      <FormGrid>
        <div className="sm:col-span-2">
          <FieldLabel>姓名</FieldLabel>
          <TextField value={data.fullName} onChange={(event) => update({ fullName: event.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>职位 / 求职意向</FieldLabel>
          <TextField value={data.headline} onChange={(event) => update({ headline: event.target.value })} />
        </div>
        <div>
          <FieldLabel>邮箱</FieldLabel>
          <TextField value={data.email} onChange={(event) => update({ email: event.target.value })} />
        </div>
        <div>
          <FieldLabel>电话</FieldLabel>
          <TextField value={data.phone} onChange={(event) => update({ phone: event.target.value })} />
        </div>
        <div>
          <FieldLabel>所在城市</FieldLabel>
          <TextField value={data.location} onChange={(event) => update({ location: event.target.value })} />
        </div>
        <div>
          <FieldLabel>个人网站</FieldLabel>
          <TextField value={data.website} onChange={(event) => update({ website: event.target.value })} />
        </div>
      </FormGrid>
    </FormCard>
  );
}
