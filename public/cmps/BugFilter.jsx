const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break

            case 'checkbox':
                value = target.checked
                break

            case 'select-multiple':
                const selectedValues = []
                for (let i = 0; i < target.selectedOptions.length; i++) {
                    selectedValues.push(target.selectedOptions[i].value)
                }
                value = selectedValues
                console.log(" selectedValues:", selectedValues)
                break

            default:
                break
        }

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    const { txt, minSeverity, sortField, sortDir, labels } = filterByToEdit
    return (
        <section className="bug-filter">
            <h2>Filter</h2>
            <form onSubmit={onSubmitFilter}>
                <label htmlFor="txt">Text: </label>
                <input value={txt} onChange={handleChange} type="text" placeholder="By Text" id="txt" name="txt" />

                <label htmlFor="minSeverity">Min Severity: </label>
                <input value={minSeverity} onChange={handleChange} type="number" placeholder="By Min Severity" id="minSeverity" name="minSeverity" />

                <label htmlFor="sortField">Sort by:</label>
                <select id="sortField" name="sortField" value={sortField} selected={sortField} onChange={handleChange}>
                    <option value="">Select sort</option>
                    <option value="title">Title</option>
                    <option value="severity">Severity</option>
                    <option value="createdAt">Created At</option>
                </select>

                <label><span>⬇</span>
                    <input type="checkbox" name="sortDir" checked={sortDir} onChange={handleChange} />
                </label>

                <select name="labels" multiple onChange={handleChange}>
                    <option value="critical">Critical</option>
                    <option value="dev-branch">Dev Branch</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="need-CR">Need-CR</option>
                </select>

            </form>
        </section>
    )
}