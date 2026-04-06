'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ImageUpload({ currentUrl, name = 'image_url' }: { currentUrl?: string | null; name?: string }) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storedUrl, setStoredUrl] = useState<string | null>(currentUrl ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return }
    setError(null)
    setUploading(true)
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `events/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('public-assets').getPublicUrl(path)
      setStoredUrl(data.publicUrl)
    } catch (err) {
      setError('Upload failed. Try again.')
      setPreview(currentUrl ?? null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Hidden input carries the final URL into the form */}
      <input type="hidden" name={name} value={storedUrl ?? ''} />

      <div
        className="relative rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer overflow-hidden"
        style={{ minHeight: 140 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      >
        {preview ? (
          <img src={preview} alt="Event preview" className="w-full h-48 object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18M9.75 9.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <p className="text-[13px] text-white/30">Drop image here or click to upload</p>
            <p className="text-[11px] text-white/20">JPG, PNG, WebP · max 5MB</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <p className="text-[13px] text-white/60 animate-pulse">Uploading…</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {preview && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); setPreview(null); setStoredUrl(null) }}
          className="text-[12px] text-white/25 hover:text-red-400 transition-colors"
        >
          Remove image
        </button>
      )}

      {error && <p className="text-[12px] text-red-400">{error}</p>}
    </div>
  )
}
