import React from 'react'
import Header from '../common/Header.jsx'
import LoadingIcon from '../common/LoadingIcon.jsx'
import YearSelector from '../common/YearSelector.jsx'
import SearchList from './SearchList.jsx'
import ProgressCard from './ProgressCard.jsx'
import MsaMds from './MsaMds.jsx'
import Reports from './Reports.jsx'
import Report from './Report.jsx'
import fetchMsas from './fetchMsas.js'
import { DISCLOSURE_REPORTS } from '../constants/disclosure-reports.js'

import './Disclosure.css'

const detailsCache = {
  institutions: {},
  msaMds: {},
  reports: {}
}

let fetchedMsas = null

Object.keys(DISCLOSURE_REPORTS).forEach(key =>
  DISCLOSURE_REPORTS[key].forEach(v => {
    if (v.value) {
      detailsCache.reports[v.value] = v
    }

    if (v.options) {
      v.options.forEach(option => {
        detailsCache.reports[option.value] = option
      })
    }
  })
)

class Disclosure extends React.Component {
  constructor(props) {
    super(props)
    this.state = { fetched: false }
    this.makeListItem = this.makeListItem.bind(this)
  }

  componentDidMount() {
    const { params } = this.props.match
    if (params.institutionId) {
      fetchMsas(params.institutionId, params.year).then(result => {
        this.setInstitution(result.institution)
        if (params.msaMdId) {
          if (params.msaMdId === 'nationwide')
            this.setMsaMd({ id: 'nationwide' })
          result.msaMds.forEach(v => {
            if (v.id === params.msaMdId) this.setMsaMd(v)
          })
        }
        const msaMds = [...result.msaMds, { id: 'nationwide' }]
        fetchedMsas = msaMds
        this.setState({ fetched: true })
      })
    } else {
      this.setState({ fetched: true })
    }
  }

  makeListItem(institution, index) {
    let url = this.props.match.url
    if (!url.match(/\/$/)) url += '/'
    const normalizedInstitution = this.props.match.params.year === '2017'
        ? {
            title: 'Respondent ID',
            id: institution.institutionId
          }
        : { title: 'LEI', id: institution.lei }
    return (
      <li key={index}>
        <h4>{institution.name}</h4>
        <p>{normalizedInstitution.title}: {normalizedInstitution.id}</p>
        <button
          className="button-link"
          onClick={e => {
            e.preventDefault()
            this.setInstitution(institution)
            this.props.history.push({
              pathname: url + normalizedInstitution.id
            })
          }}
        >
          View MSA/MDs
        </button>
      </li>
    )
  }

  setInstitution(institution) {
    const institutionId = institution.lei || institution.institutionId || institution.id
    detailsCache.institutions[institutionId] = institution
  }

  setMsaMd(msaMd) {
    detailsCache.msaMds[msaMd.id] = msaMd
  }

  render() {
    const { params } = this.props.match
    const institution = detailsCache.institutions[params.institutionId]
    const msaMd = detailsCache.msaMds[params.msaMdId]
    const report = detailsCache.reports[params.reportId]
    const institutionId =
      institution && (institution.lei || institution.institutionId || institution.id)
    const header = (
      <Header
        type={1}
        headingText="Disclosure reports"
        paragraphText="These reports summarize lending activity for individual
              institutions, both nationwide and by MSA/MD."
      />
    )

    return this.state.fetched ? (
      <React.Fragment>
        <div className="Disclosure" id="main-content">
          {header}
          <ol className="ProgressCards">
            <li>
              <ProgressCard
                title="year"
                name={
                  params.year
                    ? params.year
                    : 'Select a year'
                }
                id=''
                link={'/disclosure-reports/'}
              />
            </li>

            <li>
              <ProgressCard
                title="institution"
                name={
                  params.institutionId
                    ? institution.name
                    : params.year
                    ? 'Select an institution'
                    : ''
                }
                id={params.institutionId ? (institution.lei || institution.respondentId) : ''}
                link={ params.year
                  ? `/disclosure-reports/${params.year}`
                  : null
                }
              />
            </li>

            <li>
              <ProgressCard
                title="MSA/MD"
                name={
                  params.msaMdId
                    ? msaMd.name
                    : params.institutionId
                    ? 'Select a MSA/MD'
                    : ''
                }
                id={params.msaMdId ? msaMd.id : ''}
                link={
                  params.institutionId
                    ? `/disclosure-reports/${params.year}/${institutionId}`
                    : null
                }
              />
            </li>

            <li>
              <ProgressCard
                title="report"
                name={
                  params.reportId
                    ? report.label
                    : params.msaMdId
                    ? 'Select a report'
                    : params.institutionId
                    ? ''
                    : ''
                }
                id={params.reportId ? report.value : ''}
                link={
                  params.msaMdId
                    ? `/disclosure-reports/${params.year}/${institutionId}/${
                        msaMd.id
                      }`
                    : null
                }
              />
            </li>
          </ol>
          <hr />

          {params.year ? (
           params.year !== '2017'
            ? <h3>Disclosure reports are not yet available for 2018.</h3>
            :
            params.institutionId ? (
              params.msaMdId ? (
                params.reportId ? null : (
                  <Reports {...this.props} />
                )
              ) : (
                <MsaMds
                  {...this.props}
                  fetchedMsas={fetchedMsas}
                  selectorCallback={this.setMsaMd}
                />
              )
            ) : (
              <SearchList makeListItem={this.makeListItem} year={params.year} />
            )
          ) : (
            <YearSelector />
          )}
        </div>

        {params.reportId ? <Report {...this.props} /> : null}
      </React.Fragment>
    ) : (
      <LoadingIcon />
    )
  }
}

export default Disclosure
