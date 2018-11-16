import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import React from 'react'
import { graphql } from 'react-apollo'

import { Table, TableCell, TableHeader, TableRow, TableRows } from '@broad/ui'

function formatExponential(number) {
  return Number(number.toPrecision(4)).toExponential()
}

export function BaseAnalysisGroupsTable({ groups }) {
  return (
    <Table>
      <TableRows>
        <TableHeader>
          <TableCell width={'200px'}>Group</TableCell>
          <TableCell width={'60px'}>AC Case</TableCell>
          <TableCell width={'60px'}>AN Case</TableCell>
          <TableCell width={'60px'}>AC Ctrl</TableCell>
          <TableCell width={'60px'}>AN Ctrl</TableCell>
          <TableCell width={'60px'}>AF Case</TableCell>
          <TableCell width={'60px'}>AF Ctrl</TableCell>
          <TableCell width={'60px'}>P-value</TableCell>
          <TableCell width={'60px'}>Beta</TableCell>
        </TableHeader>
        {groups.map(group => (
          <TableRow key={group.analysis_group}>
            <TableCell width={'200px'}>{group.analysis_group}</TableCell>
            <TableCell width={'60px'}>{group.ac_case}</TableCell>
            <TableCell width={'60px'}>{group.an_case}</TableCell>
            <TableCell width={'60px'}>{group.ac_ctrl}</TableCell>
            <TableCell width={'60px'}>{group.an_ctrl}</TableCell>
            <TableCell width={'60px'}>
              {group.an_case === 0 ? 0 : formatExponential(group.ac_case / group.an_case)}
            </TableCell>
            <TableCell width={'60px'}>
              {group.an_ctrl === 0 ? 0 : formatExponential(group.ac_ctrl / group.an_ctrl)}
            </TableCell>
            <TableCell width={'60px'}>{group.p}</TableCell>
            <TableCell width={'60px'}>{group.se}</TableCell>
          </TableRow>
        ))}
      </TableRows>
    </Table>
  )
}

BaseAnalysisGroupsTable.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      analysis_group: PropTypes.string.isRequired,
      ac_case: PropTypes.number.isRequired,
      an_case: PropTypes.number.isRequired,
      ac_ctrl: PropTypes.number.isRequired,
      an_ctrl: PropTypes.number.isRequired,
      p: PropTypes.number,
      se: PropTypes.number,
    })
  ).isRequired,
}

const analysisGroupsQuery = gql`
  query AnalysisGroups($variantId: String) {
    groups: analysisGroups(variant_id: $variantId) {
      analysis_group
      ac_case
      an_case
      ac_ctrl
      an_ctrl
      p
      se
    }
  }
`

const ConnectedAnalysisGroupsTable = graphql(analysisGroupsQuery, {
  options: ({ variantId }) => ({
    variables: { variantId },
    errorPolicy: 'ignore',
  }),
})(({ data: { loading, groups } }) => {
  if (loading) {
    return <span>Loading groups...</span>
  }
  return <BaseAnalysisGroupsTable groups={groups} />
})

export default ConnectedAnalysisGroupsTable
