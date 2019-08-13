module StashEngine
  class UserSerializer
    include SerializerMixin

    TRANSFORM_HASH = { 'dataone' => 'dryad', 'ucpress' => 'dryad', 'ocdp' => 'uci'}.freeze
    TRANSFORM_ITEMS = TRANSFORM_HASH.keys.freeze

    REJECT_COLUMNS = %w[id].freeze
    COLUMNS = (StashEngine::User.column_names - REJECT_COLUMNS).freeze

    def hash
      super.merge(doorkeeper_applications: Doorkeeper::Application.where(owner_id: @my_model.id)) \
        .merge(tenant_transform)
    end

    def tenant_transform
      return {} unless TRANSFORM_ITEMS.include?(@my_model.tenant_id)
      { 'tenant_id' => TRANSFORM_HASH[@my_model.tenant_id] }
    end

  end
end
