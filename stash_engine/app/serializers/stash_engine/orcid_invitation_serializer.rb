module StashEngine
  class OrcidInvitationSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id identifier_id].freeze
    COLUMNS = (StashEngine::OrcidInvitation.column_names - REJECT_COLUMNS).freeze

  end
end