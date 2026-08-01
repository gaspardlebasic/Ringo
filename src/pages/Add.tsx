import { useEffect, useState } from 'react'
import { supabase, type Item } from '../supabase'
import { getName } from '../lib/name'

export default function Add() {
  const [text, setText] = useState('')
  const [mine, setMine] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [saving, setSaving] = useState(false)
  const name = getName() ?? 'Anonyme'

  async function refresh() {
    const { data: mineData } = await supabase
      .from('items')
      .select('*')
      .eq('added_by', name)
      .order('created_at', { ascending: false })
    setMine((mineData ?? []) as Item[])
    const { count } = await supabase.from('items').select('*', { count: 'exact', head: true })
    setTotal(count ?? 0)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const v = text.trim()
    if (!v) return
    setSaving(true)
    const { error } = await supabase.from('items').insert({ text: v, added_by: name })
    setSaving(false)
    if (error) {
      alert('Erreur : ' + error.message)
      return
    }
    setText('')
    refresh()
  }

  async function remove(id: number) {
    if (!confirm('Supprimer cet item ?')) return
    await supabase.from('items').delete().eq('id', id)
    refresh()
  }

  return (
    <div className="page add">
      <h1>Ajouter des items</h1>
      <p className="muted">
        Propose des choses susceptibles d'arriver pendant le mariage (« Tata pleure pendant la messe »,
        « Quelqu'un renverse un verre de vin », …). Elles iront dans le répertoire commun.
      </p>

      <form onSubmit={add} className="add-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex : Le curé fait une blague"
          rows={2}
          maxLength={140}
        />
        <button type="submit" className="btn btn-primary" disabled={saving || !text.trim()}>
          {saving ? 'Ajout…' : 'Ajouter'}
        </button>
      </form>

      <p className="muted small">{total} item{total > 1 ? 's' : ''} dans le répertoire commun.</p>

      <h2 className="section-title">Tes ajouts ({mine.length})</h2>
      {mine.length === 0 ? (
        <p className="muted">Tu n'as encore rien ajouté.</p>
      ) : (
        <ul className="item-list">
          {mine.map((it) => (
            <li key={it.id} className="item-row">
              <span className="item-text">{it.text}</span>
              <button className="del-btn" onClick={() => remove(it.id)} aria-label="Supprimer">
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
