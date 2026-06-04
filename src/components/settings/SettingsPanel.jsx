import { useState, useEffect } from 'react'
import { useKVStore } from '../../context/KVStoreContext'
import { DEFAULT_RACE_SETTINGS } from '../../context/KVStoreContext'
import { getTwitchUser } from '../../lib/twitch'
import ErrorNewUser from '../ErrorNewUser'
import UploadButton from '../UploadButton'

const DEV_MODE = import.meta.env.VITE_ENABLE_DEV_MODE === 'true'

const resolveUsername = async (input) => {
  try {
    const user = await getTwitchUser(input.trim())
    return user.display_name  // Twitch display name
  } catch {
    return input.trim() // fall back to raw input if lookup fails
  }
}

const CollapsibleSection = ({ title, children, defaultCollapsed = true }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  return (
    <div className="flex flex-col gap-1">
      <div
        onClick={() => setCollapsed(prev => !prev)}
        className="w-full flex items-center justify-between cursor-pointer rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 hover:bg-gray-700 transition-colors"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">{title}</span>
        <span className="text-xs text-gray-400">{collapsed ? '▼' : '▲'}</span>
      </div>
      {!collapsed && (
        <div className="px-3 py-3 bg-gray-800/60 border border-t-0 border-gray-600 rounded-b-lg flex flex-col gap-3">
          {children}
        </div>
      )}
    </div>
  )
}

const EditableList = ({ items = [], onChange, placeholder, onResolve }) => {
  const [newItem, setNewItem] = useState('')
  const [resolving, setResolving] = useState(false)

  const add = async () => {
    const trimmed = newItem.trim()
    if (!trimmed) return

    setResolving(true)
    const resolved = onResolve ? await onResolve(trimmed) : trimmed
    setResolving(false)

    if (!resolved || items.map(i => i.toLowerCase()).includes(resolved.toLowerCase())) return
    onChange([...items, resolved])
    setNewItem('')
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const updated = [...items]
              updated[i] = e.target.value
              onChange(updated)
            }}
            className="flex-1 rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder={placeholder}
          disabled={resolving}
          className="flex-1 rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-40"
        />
        <button
          onClick={add}
          disabled={resolving}
          className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-40 transition-colors"
        >
          {resolving ? '...' : '+ Add'}
        </button>
      </div>
    </div>
  )
}

const MessageInput = ({ label, value, onChange, hint }) => (
  <label className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      {hint && <span className="text-xs text-gray-600">variables: {hint}</span>}
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
    />
  </label>
)

const NumInput = ({ label, value, onChange, step = 1 }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs text-gray-400">{label}</span>
    <input
      type="number"
      step={step}
      value={Math.round(value * 100) / 100}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500 w-full"
    />
  </label>
)

const WordCategory = ({ category, words, onRename, onRemove, onWordsChange }) => {
  const [collapsed, setCollapsed] = useState(true)
  const [newWord, setNewWord] = useState('')

  const addWord = () => {
    const trimmed = newWord.trim()
    if (!trimmed || words.includes(trimmed)) return
    onWordsChange([...words, trimmed])
    setNewWord('')
  }

  return (
    <div className="flex flex-col rounded-lg border border-gray-600 overflow-hidden">
      {/* Category header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-700">
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="text-xs text-gray-400 w-4 flex-shrink-0 bg-transparent border-none focus:outline-none"
        >
          {collapsed ? '▲' : '▼'}
        </button>
        <input
          type="text"
          defaultValue={category}
          onBlur={(e) => {
            const val = e.target.value.trim()
            if (val && val !== category) onRename(val)
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-transparent text-sm font-semibold text-purple-300 focus:outline-none focus:text-white border-b border-transparent focus:border-purple-500"
        />
        <span className="text-xs text-gray-500 flex-shrink-0">{words.length} words</span>
        <button
          onClick={onRemove}
          className="text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Words */}
      {!collapsed && (
        <div className="flex flex-col gap-2 px-3 py-3 bg-gray-800/60">
          <div className="flex flex-wrap gap-1">
            {words.map((word, i) => (
              <div
                key={i}
                className="flex items-center gap-1 rounded-full bg-gray-700 border border-gray-600 px-2 py-0.5"
              >
                <span className="text-xs text-white">{word}</span>
                <button
                  onClick={() => onWordsChange(words.filter((_, j) => j !== i))}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addWord()}
              placeholder="Add word..."
              className="flex-1 rounded bg-gray-700 border border-gray-600 px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={addWord}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const WordBankEditor = ({ wordBank, onChange }) => {
  const [newCategory, setNewCategory] = useState('')

  const addCategory = () => {
    const trimmed = newCategory.trim()
    if (!trimmed || wordBank[trimmed]) return
    onChange({ ...wordBank, [trimmed]: [] })
    setNewCategory('')
  }

  const renameCategory = (oldKey, newKey) => {
    if (!newKey || newKey === oldKey || wordBank[newKey]) return
    const updated = {}
    for (const [k, v] of Object.entries(wordBank)) {
      updated[k === oldKey ? newKey : k] = v
    }
    onChange(updated)
  }

  const removeCategory = (category) => {
    const updated = { ...wordBank }
    delete updated[category]
    onChange(updated)
  }

  const updateWords = (category, words) => {
    onChange({ ...wordBank, [category]: words })
  }

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(wordBank).map(([category, words]) => (
        <WordCategory
          key={category}
          category={category}
          words={words}
          onRename={(newKey) => renameCategory(category, newKey)}
          onRemove={() => removeCategory(category)}
          onWordsChange={(updated) => updateWords(category, updated)}
        />
      ))}
      <div className="flex gap-2 mt-1">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          placeholder="New category name..."
          className="flex-1 rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={addCategory}
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          + Add Category
        </button>
      </div>
    </div>
  )
}

const DebouncedUrlInput = ({ value, onChange }) => {
  const [local, setLocal] = useState(value)
  useEffect(() => { setLocal(value) }, [value])
  useEffect(() => {
    if (local === value) return
    const timer = setTimeout(() => onChange(local), 600)
    return () => clearTimeout(timer)
  }, [local])
  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      placeholder="https://..."
      className="rounded bg-gray-700 border border-gray-600 px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 grow-1"
    />
  )
}

const SettingsPanel = () => {
  const { racers, raceSettings, updateRaceSettings, tracks, error: kvStoreError } = useKVStore()
  const [local, setLocal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const settings = local ?? raceSettings ?? DEFAULT_RACE_SETTINGS

  const update = (patch) => {
    setLocal(prev => ({ ...(prev ?? settings), ...patch }))
    setSaved(false)
  }

  const updateMessages = (patch) => {
    update({ messages: { ...settings.messages, ...patch } })
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateRaceSettings(settings)
      setSaved(true)
      setLocal(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }


  if (kvStoreError === 'Failed to list kvstore keys (404)' ) return <ErrorNewUser error={error}/>
  if (kvStoreError) return <p className="text-sm text-red-400">{error}</p>

  if (!raceSettings) return (
    <p className="text-sm text-gray-400">Loading settings...</p>
  )

  return (
    <div className="flex flex-col gap-3">

      {/* Save bar */}
      <div className="flex items-center justify-between pb-2">
        <p className="text-sm text-gray-400">Changes are not saved until you click Save.</p>
        <div className="flex items-center gap-3">
          {saved && <p className="text-sm text-green-400">Saved!</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving || !local}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <CollapsibleSection title="Current Track">
        <p className="text-xs text-gray-500">
            The track loaded when the widget starts. If unset, a random track is chosen.
        </p>
        <select
            value={settings.defaultTrack ?? ''}
            onChange={(e) => update({ defaultTrack: e.target.value || null })}
            className="rounded bg-gray-700 border border-gray-600 px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500 w-full"
        >
            <option value="">— Random —</option>
            {Object.keys(tracks ?? {}).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
        </select>
        {settings.defaultTrack && !tracks?.[settings.defaultTrack] && (
            <p className="text-xs text-red-400">
            "{settings.defaultTrack}" no longer exists — it will fall back to random.
            </p>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Race Duration">
        <p className="text-xs text-gray-500">
            How long an individual race lasts.
        </p>
        <NumInput
          label="Race Duration (seconds)"
          value={settings.raceDuration}
          onChange={(v) => update({ raceDuration: v })}
          step={5}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Testing Mode" defaultCollapsed={true}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.testing}
            onChange={(e) => update({ testing: e.target.checked })}
            className="w-4 h-4 accent-purple-500"
          />
          <span className="text-sm text-white">Enable testing mode</span>
          <span className="text-xs text-gray-500">(uses test racers)</span>
        </label>

        
        <CollapsibleSection title="Test Racers">
            <p className="text-xs text-gray-500">Racers added automatically when testing mode is on.</p>
            <EditableList
              items={settings.testRacers}
              onChange={(v) => update({ testRacers: v })}
              placeholder="username"
              onResolve={resolveUsername}
            />
        </CollapsibleSection>
      </CollapsibleSection>

      <CollapsibleSection title="Global Car Override" defaultCollapsed={true}>
        <p className="text-xs text-gray-500">
          Choose a car to use for ALL users. 
        </p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.carOverride?.enabled || false}
            onChange={(e) => update({ carOverride: { ...settings.carOverride, enabled: e.target.checked } })}
            className="w-4 h-4 accent-purple-500"
          />
          <span className="text-sm text-white">Enable car override</span>
          <span className="text-xs text-gray-500">(overrides all user cars)</span>
        </label>
        
        <select
          value={
            settings.carOverride?.carName 
              ? JSON.stringify({ username: settings.carOverride.userName, carName: settings.carOverride.carName }) 
              : ''
          }
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              update({ carOverride: { ...settings.carOverride, carName: null, userName: null } })
              return
            }

            const { username, carName } = JSON.parse(val)
            update({ 
              carOverride: { 
                ...settings.carOverride, 
                carName: carName, 
                userName: username 
              } 
            })
          }}
          className="rounded bg-gray-700 border border-gray-600 px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500 w-full"
      >
          <option value="">-- Disable Override --</option>
          {Object.entries(racers ?? {}).flatMap(([username, cars]) => 
            cars.map(car => (
              <option 
                key={`${username}-${car.name}`} 
                value={JSON.stringify({ username, carName: car.name })} 
              >
                {car.name} ({username})
              </option>
            ))
          )}
      </select>

      </CollapsibleSection>

      <CollapsibleSection title="Chat Commands" defaultCollapsed={true}>
        <CollapsibleSection title="Join Commands">
          <p className="text-xs text-gray-500">Chat messages that allows a user to join the race.</p>
          <EditableList
            items={settings.joinCommands}
            onChange={(v) => update({ joinCommands: v })}
            placeholder="!join"
          />
        </CollapsibleSection>

        <CollapsibleSection title="Go Commands">
          <p className="text-xs text-gray-500">Broadcaster commands that start the race.</p>
          <EditableList
            items={settings.goCommands}
            onChange={(v) => update({ goCommands: v })}
            placeholder="!go"
          />
        </CollapsibleSection>

        <CollapsibleSection title="Reset Commands">
          <p className="text-xs text-gray-500">Moderator commands that restart the race.</p>
          <EditableList
            items={settings.resetCommands}
            onChange={(v) => update({ resetCommands: v })}
            placeholder="!reset"
          />
        </CollapsibleSection>
      </CollapsibleSection>
      
      <CollapsibleSection title="Race History Filters" defaultCollapsed={true}>
        <p className="text-xs text-gray-500">Users to exclude from the race history.</p>
        <EditableList
          items={settings.removeUsers}
          onChange={(v) => update({ removeUsers: v })}
          placeholder="username"
          onResolve={resolveUsername}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Track Alignment Image">
        <p className="text-xs text-gray-500">Screenshot of your stream to help with sizing of art assets.</p>
        <label className="flex gap-2">
          <DebouncedUrlInput 
            value={settings?.alignmentImage || ""} 
            onChange={(v) => update({ alignmentImage: v })} 
          />
          <UploadButton
            onUploaded={(v) => update({ alignmentImage: v })}
          />
        </label>
      </CollapsibleSection>

      <CollapsibleSection title="Bot Messages during Race">
        <p className="text-xs text-gray-500">Messages that are sent during the race. These will be sent via the Streamelements chat bot. (Leave blank to disable)</p>
        <MessageInput
          label="Race started"
          value={settings.messages.raceStarted}
          onChange={(v) => updateMessages({ raceStarted: v })}
        />
        {settings.enableBoostWords &&
          <>
            <MessageInput
              label="Word boost found"
              value={settings.messages.boostFound}
              onChange={(v) => updateMessages({ boostFound: v })}
              hint="{username}"
            />
            <MessageInput
              label="Word clue"
              value={settings.messages.wordClue}
              onChange={(v) => updateMessages({ wordClue: v })}
              hint="{category}"
            />
          </>
        }
        <MessageInput
          label="Winner reward message (skipped during testing mode)"
          value={settings.messages.winner}
          onChange={(v) => updateMessages({ winner: v })}
          hint="{username}"
        />
        <MessageInput
          label="Race saved message (skipped during testing mode)"
          value={settings.messages.raceSaved ?? "Race results saved!"}
          onChange={(v) => updateMessages({ raceSaved: v })}
        />
      </CollapsibleSection>

      { settings.enableBoostWords &&
        <CollapsibleSection title="Boost Word Bank">
          <p className="text-xs text-gray-500">Categories and words used for the boost word game. Click the arrow next to a category name to expand it.</p>
          <WordBankEditor
            wordBank={settings.wordBank}
            onChange={(v) => update({ wordBank: v })}
          />
        </CollapsibleSection>
      }

      {
        DEV_MODE && (
          <CollapsibleSection title="Developer Mode" defaultCollapsed={true}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dev_mode}
                onChange={(e) => update({ dev_mode: e.target.checked })}
                className="w-4 h-4 accent-purple-500"
              />
              <span className="text-sm text-white">Enable developer mode</span>
              <span className="text-xs text-gray-500">(only enable if you know what you're doing)</span>
            </label>
            <p className="text-sm text-gray-500">
              Feature(s) behind this flag are experimental and may change or be removed in future versions.
            </p>
            <p className="text-xs text-gray-500">
              - Custom draw and update functions for car assets
            </p>
          </CollapsibleSection>
        )
      }

    </div>
  )
}

export default SettingsPanel